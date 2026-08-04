import {
  AppointmentStatus,
  AttendanceStatus,
  EntityStatus,
  NotificationTargetType,
  NotificationType,
  UserType,
} from '@prisma/client';
import { prisma } from '../../config/database.js';
import { AppError } from '../../utils/AppError.js';
import { buildPaginationMeta, parsePagination } from '../../utils/pagination.js';
import { getAppointmentDateTime, getAppointmentEndDateTime, normalizeDateOnly, parseTimeToMinutes, addMinutesToTime } from '../../utils/slotGenerator.js';
import { appointmentsRepository } from './appointments.repository.js';
import { ATTENDANCE_MARK_GRACE_MINUTES } from '../../constants/attendance.js';
import {
  applyNoShowPenalty,
  assertPatientCanBook,
  syncPatientCommitmentState,
} from '../../services/commitment.service.js';
import { emitToUser } from '../../websocket/emitter.js';
import { SocketEvents } from '../../websocket/events.js';

export class AppointmentsService {
  async book(patientId: string, data: {
    doctorId: string;
    date: Date;
    time: string;
    notes?: string;
    patientName?: string;
    patientPhone?: string;
  }) {
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) throw new AppError('Patient not found', 404);
    if (patient.status !== EntityStatus.ACTIVE) throw new AppError('Account not active', 403);
    await assertPatientCanBook(patientId);

    const doctor = await prisma.doctor.findFirst({
      where: { id: data.doctorId, status: EntityStatus.ACTIVE },
    });
    if (!doctor) throw new AppError('Doctor not available', 404);

    await this.assertNoPrivateSlotConflict(data.doctorId, data.date, data.time);

    try {
      const appointment = await appointmentsRepository.create({
        ...data,
        date: normalizeDateOnly(data.date),
        patientId,
        patientName: data.patientName ?? patient.name,
        patientPhone: data.patientPhone ?? patient.phone,
      });

      await this.notifyDoctor(data.doctorId, appointment.id);
      emitToUser(UserType.DOCTOR, data.doctorId, SocketEvents.APPOINTMENT_NEW, appointment);

      return appointment;
    } catch (error) {
      if (error instanceof Error && error.message === 'SLOT_UNAVAILABLE') {
        throw new AppError('Selected time slot is not available', 409);
      }
      throw error;
    }
  }

  async getById(id: string, userId: string, userType: UserType) {
    const appointment = await appointmentsRepository.findById(id);
    if (!appointment) throw new AppError('Appointment not found', 404);
    this.assertAccess(appointment, userId, userType);
    return appointment;
  }

  async listForUser(userId: string, userType: UserType, query: Record<string, unknown>) {
    const statuses = query.statuses as AppointmentStatus[] | undefined;
    const status =
      statuses && statuses.length > 0
        ? statuses
        : query.status
          ? [query.status as AppointmentStatus]
          : undefined;

    const filters: Parameters<typeof appointmentsRepository.findMany>[0] = {
      status,
      from: query.from as Date | undefined,
      to: query.to as Date | undefined,
      sort: query.sort as 'asc' | 'desc' | undefined,
    };

    if (userType === UserType.PATIENT) {
      filters.patientId = userId;
      filters.isPrivate = false;
    }
    if (userType === UserType.DOCTOR) {
      filters.doctorId = userId;
      if (query.isPrivate !== undefined) {
        filters.isPrivate = query.isPrivate === 'true';
      }
      await this.finalizeExpiredPrivateAppointments(userId);
    }

    const pagination = parsePagination(query);
    const { items, total } = await appointmentsRepository.findMany(filters, pagination);
    return { items, meta: buildPaginationMeta(pagination.page, pagination.limit, total) };
  }

  async createPrivateAppointment(
    doctorId: string,
    data: {
      patientName?: string;
      patientPhone?: string;
      patientId?: string;
      date: Date;
      startTime: string;
      endTime: string;
      notes?: string;
    },
  ) {
    const startMin = parseTimeToMinutes(data.startTime);
    const endMin = parseTimeToMinutes(data.endTime);
    if (startMin >= endMin) {
      throw new AppError('وقت النهاية يجب أن يكون بعد وقت البداية', 400);
    }

    const doctor = await prisma.doctor.findFirst({
      where: { id: doctorId, status: EntityStatus.ACTIVE },
    });
    if (!doctor) throw new AppError('Doctor not available', 404);

    const conflictingPrivate = await appointmentsRepository.findConflictingPrivate(
      doctorId,
      data.date,
      data.startTime,
      data.endTime,
    );
    if (conflictingPrivate) {
      throw new AppError('يوجد موعد خاص آخر يتداخل مع هذا الوقت', 409);
    }

    const conflictingRegular = await appointmentsRepository.findConflictingBookedRegular(
      doctorId,
      data.date,
      data.startTime,
      data.endTime,
    );
    if (conflictingRegular) {
      throw new AppError('يوجد موعد محجوز لمريض في هذه الفترة الزمنية', 409);
    }

    let patientName = data.patientName;
    let patientPhone = data.patientPhone;
    if (data.patientId) {
      const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
      if (!patient) throw new AppError('Patient not found', 404);
      if (!patientName) patientName = patient.name;
      if (!patientPhone) patientPhone = patient.phone;
    } else if (!patientName?.trim()) {
      throw new AppError('Patient name is required for private appointments', 400);
    }

    const appointment = await appointmentsRepository.createPrivate({
      doctorId,
      patientId: data.patientId,
      patientName,
      patientPhone,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      notes: data.notes,
    });

    emitToUser(UserType.DOCTOR, doctorId, SocketEvents.APPOINTMENT_NEW, appointment);
    return appointment;
  }

  async updatePrivateAppointment(
    id: string,
    doctorId: string,
    data: {
      patientName?: string;
      patientPhone?: string;
      patientId?: string;
      date: Date;
      startTime: string;
      endTime: string;
      notes?: string;
    },
  ) {
    const existing = await appointmentsRepository.findById(id);
    if (!existing || !existing.isPrivate) {
      throw new AppError('Appointment not found', 404);
    }
    if (existing.doctorId !== doctorId) {
      throw new AppError('Forbidden', 403);
    }

    const startMin = parseTimeToMinutes(data.startTime);
    const endMin = parseTimeToMinutes(data.endTime);
    if (startMin >= endMin) {
      throw new AppError('وقت النهاية يجب أن يكون بعد وقت البداية', 400);
    }

    const conflictingPrivate = await appointmentsRepository.findConflictingPrivate(
      doctorId,
      data.date,
      data.startTime,
      data.endTime,
      id,
    );
    if (conflictingPrivate) {
      throw new AppError('يوجد موعد خاص آخر يتداخل مع هذا الوقت', 409);
    }

    const conflictingRegular = await appointmentsRepository.findConflictingBookedRegular(
      doctorId,
      data.date,
      data.startTime,
      data.endTime,
      id,
    );
    if (conflictingRegular) {
      throw new AppError('يوجد موعد محجوز لمريض في هذه الفترة الزمنية', 409);
    }

    let patientName = data.patientName;
    let patientPhone = data.patientPhone;
    if (data.patientId) {
      const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
      if (!patient) throw new AppError('Patient not found', 404);
      if (!patientName) patientName = patient.name;
      if (!patientPhone) patientPhone = patient.phone;
    }

    const updated = await appointmentsRepository.updatePrivate(id, {
      patientId: data.patientId,
      patientName,
      patientPhone,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      notes: data.notes,
    });

    emitToUser(UserType.DOCTOR, doctorId, SocketEvents.APPOINTMENT_UPDATED, updated);
    return updated;
  }

  async deletePrivateAppointment(id: string, doctorId: string) {
    const existing = await appointmentsRepository.findById(id);
    if (!existing || !existing.isPrivate) {
      throw new AppError('Appointment not found', 404);
    }
    if (existing.doctorId !== doctorId) {
      throw new AppError('Forbidden', 403);
    }

    await appointmentsRepository.deletePrivate(id);
    emitToUser(UserType.DOCTOR, doctorId, SocketEvents.APPOINTMENT_UPDATED, { id, status: AppointmentStatus.CANCELLED });
    return { success: true };
  }

  async cancel(id: string, userId: string, userType: UserType) {
    const appointment = await appointmentsRepository.findById(id);
    if (!appointment) throw new AppError('Appointment not found', 404);
    this.assertAccess(appointment, userId, userType);

    if (
      appointment.status === AppointmentStatus.CANCELLED ||
      appointment.status === AppointmentStatus.COMPLETED
    ) {
      throw new AppError('Cannot cancel this appointment', 400);
    }

    try {
      const result = await appointmentsRepository.cancel(id);
      emitToUser(UserType.DOCTOR, appointment.doctorId, SocketEvents.APPOINTMENT_UPDATED, result);
      if (appointment.patientId) {
        emitToUser(UserType.PATIENT, appointment.patientId, SocketEvents.APPOINTMENT_UPDATED, result);
      }
      return result;
    } catch {
      throw new AppError('Failed to cancel appointment', 400);
    }
  }

  async reschedule(id: string, userId: string, userType: UserType, date: Date, time: string) {
    const appointment = await appointmentsRepository.findById(id);
    if (!appointment) throw new AppError('Appointment not found', 404);
    this.assertAccess(appointment, userId, userType);

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new AppError('Cannot reschedule cancelled appointment', 400);
    }

    await this.assertNoPrivateSlotConflict(appointment.doctorId, date, time);

    try {
      const result = await appointmentsRepository.reschedule(id, normalizeDateOnly(date), time);
      emitToUser(UserType.DOCTOR, appointment.doctorId, SocketEvents.APPOINTMENT_UPDATED, result);
      if (appointment.patientId) {
        emitToUser(UserType.PATIENT, appointment.patientId, SocketEvents.APPOINTMENT_UPDATED, result);
      }
      return result;
    } catch (error) {
      if (error instanceof Error && error.message === 'SLOT_UNAVAILABLE') {
        throw new AppError('Selected time slot is not available', 409);
      }
      throw new AppError('Failed to reschedule appointment', 400);
    }
  }

  async accept(id: string, doctorId: string) {
    const appointment = await appointmentsRepository.findById(id);
    if (!appointment || appointment.doctorId !== doctorId) {
      throw new AppError('Appointment not found', 404);
    }
    if (appointment.status !== AppointmentStatus.PENDING) {
      throw new AppError('Appointment is not pending', 400);
    }

    const result = await appointmentsRepository.updateStatus(id, AppointmentStatus.CONFIRMED);
    if (appointment.patientId) {
      await this.notifyPatient(appointment.patientId, 'Appointment confirmed', result.id);
      emitToUser(UserType.PATIENT, appointment.patientId, SocketEvents.APPOINTMENT_UPDATED, result);
    }
    return result;
  }

  async reject(id: string, doctorId: string) {
    const appointment = await appointmentsRepository.findById(id);
    if (!appointment || appointment.doctorId !== doctorId) {
      throw new AppError('Appointment not found', 404);
    }
    if (appointment.status !== AppointmentStatus.PENDING) {
      throw new AppError('Appointment is not pending', 400);
    }

    const result = await appointmentsRepository.reject(id);
    if (appointment.patientId) {
      await this.notifyPatient(appointment.patientId, 'Appointment rejected', result.id);
      emitToUser(UserType.PATIENT, appointment.patientId, SocketEvents.APPOINTMENT_UPDATED, result);
    }
    return result;
  }

  async doctorManualBook(
    doctorId: string,
    data: {
      patientName: string;
      patientPhone?: string;
      date: Date;
      time: string;
      notes?: string;
    },
  ) {
    const doctor = await prisma.doctor.findFirst({
      where: { id: doctorId, status: EntityStatus.ACTIVE },
    });
    if (!doctor) throw new AppError('Doctor not available', 404);

    await this.assertNoPrivateSlotConflict(doctorId, data.date, data.time);

    try {
      const appointment = await appointmentsRepository.createDoctorManual({
        ...data,
        doctorId,
        date: normalizeDateOnly(data.date),
      });
      emitToUser(UserType.DOCTOR, doctorId, SocketEvents.APPOINTMENT_NEW, appointment);
      return appointment;
    } catch (error) {
      if (error instanceof Error && error.message === 'SLOT_UNAVAILABLE') {
        throw new AppError('Selected time slot is not available', 409);
      }
      throw error;
    }
  }

  async markAttendance(id: string, doctorId: string, attendanceStatus: AttendanceStatus) {
    const appointment = await appointmentsRepository.findById(id);
    if (!appointment || appointment.doctorId !== doctorId) {
      throw new AppError('Appointment not found', 404);
    }

    if (appointment.isPrivate) {
      throw new AppError('Attendance cannot be marked for private appointments', 400);
    }

    if (
      appointment.status !== AppointmentStatus.CONFIRMED &&
      appointment.status !== AppointmentStatus.COMPLETED
    ) {
      throw new AppError('Attendance can only be marked for confirmed appointments', 400);
    }

    if (
      appointment.attendanceStatus !== AttendanceStatus.PENDING &&
      appointment.attendanceStatus !== AttendanceStatus.LATE
    ) {
      throw new AppError('Attendance has already been recorded', 400);
    }

    const appointmentAt = getAppointmentDateTime(new Date(appointment.date), appointment.time);
    const graceMs = ATTENDANCE_MARK_GRACE_MINUTES * 60 * 1000;
    if (appointmentAt.getTime() - graceMs > Date.now()) {
      throw new AppError('Cannot mark attendance before the appointment time', 400);
    }

    const status =
      attendanceStatus === AttendanceStatus.ATTENDED
        ? AppointmentStatus.COMPLETED
        : attendanceStatus === AttendanceStatus.ABSENT
          ? AppointmentStatus.NO_SHOW
          : appointment.status;

    const result = await appointmentsRepository.updateAttendance(id, attendanceStatus, status);

    if (attendanceStatus === AttendanceStatus.ABSENT && appointment.patientId) {
      const penalty = await applyNoShowPenalty(appointment.patientId);
      if (penalty.blocked) {
        await this.cancelFutureAppointmentsForBlockedPatient(appointment.patientId, id);
      }
    }

    const refreshed = await appointmentsRepository.findById(id);

    if (appointment.patientId) {
      emitToUser(UserType.PATIENT, appointment.patientId, SocketEvents.APPOINTMENT_UPDATED, refreshed ?? result);
      const patientProfile = await syncPatientCommitmentState(appointment.patientId);
      if (patientProfile) {
        emitToUser(UserType.PATIENT, appointment.patientId, SocketEvents.PATIENT_PROFILE_UPDATED, patientProfile);
      }
    }
    emitToUser(UserType.DOCTOR, doctorId, SocketEvents.APPOINTMENT_UPDATED, refreshed ?? result);

    return refreshed ?? result;
  }

  private async finalizeExpiredPrivateAppointments(doctorId: string) {
    const privates = await prisma.appointment.findMany({
      where: {
        doctorId,
        isPrivate: true,
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      },
      select: { id: true, date: true, time: true, endTime: true },
    });

    const now = new Date();
    const expiredIds = privates
      .filter((item) => getAppointmentEndDateTime(new Date(item.date), item.time, item.endTime) <= now)
      .map((item) => item.id);

    if (expiredIds.length === 0) return;

    await prisma.appointment.updateMany({
      where: { id: { in: expiredIds } },
      data: { status: AppointmentStatus.COMPLETED },
    });
  }

  async cancelFutureAppointmentsForBlockedPatient(patientId: string, excludeAppointmentId?: string) {
    const now = new Date();
    const candidates = await appointmentsRepository.findActiveByPatient(patientId, excludeAppointmentId);
    const upcoming = candidates.filter(
      (item) => getAppointmentDateTime(new Date(item.date), item.time) > now,
    );

    if (upcoming.length === 0) {
      return [];
    }

    const cancelled = [];
    for (const item of upcoming) {
      try {
        const result = await appointmentsRepository.cancel(item.id);
        cancelled.push(result);
        emitToUser(UserType.DOCTOR, item.doctorId, SocketEvents.APPOINTMENT_UPDATED, result);
        emitToUser(UserType.PATIENT, patientId, SocketEvents.APPOINTMENT_UPDATED, result);
      } catch {
        // Skip appointments that cannot be cancelled.
      }
    }

    if (cancelled.length > 0) {
      await prisma.notification.create({
        data: {
          targetType: NotificationTargetType.PATIENT,
          targetId: patientId,
          title: 'Future appointments cancelled',
          message: `${cancelled.length} upcoming appointment(s) were cancelled because your booking access was suspended.`,
          type: NotificationType.APPOINTMENT,
        },
      });
    }

    return cancelled;
  }

  private async assertNoPrivateSlotConflict(doctorId: string, date: Date, time: string) {
    const normalizedDate = normalizeDateOnly(date);
    const slotDuration = await appointmentsRepository.resolveSlotDurationMinutes(
      doctorId,
      normalizedDate,
      time,
    );
    const endTime = addMinutesToTime(time, slotDuration);
    const conflictingPrivate = await appointmentsRepository.findConflictingPrivate(
      doctorId,
      normalizedDate,
      time,
      endTime,
    );
    if (conflictingPrivate) {
      throw new AppError('Selected time slot is not available', 409);
    }
  }

  private assertAccess(
    appointment: { patientId: string | null; doctorId: string; isPrivate?: boolean },
    userId: string,
    userType: UserType,
  ) {
    if (userType === UserType.ADMIN) return;
    if (userType === UserType.PATIENT) {
      if (appointment.isPrivate || appointment.patientId !== userId) {
        throw new AppError('Forbidden', 403);
      }
    }
    if (userType === UserType.DOCTOR && appointment.doctorId !== userId) {
      throw new AppError('Forbidden', 403);
    }
  }

  private async notifyDoctor(doctorId: string, appointmentId: string) {
    await prisma.notification.create({
      data: {
        targetType: NotificationTargetType.DOCTOR,
        targetId: doctorId,
        title: 'New appointment request',
        message: `You have a new appointment request (#${appointmentId.slice(0, 8)})`,
        type: NotificationType.BOOKING,
      },
    });
  }

  private async notifyPatient(patientId: string, title: string, appointmentId: string) {
    await prisma.notification.create({
      data: {
        targetType: NotificationTargetType.PATIENT,
        targetId: patientId,
        title,
        message: `Your appointment (#${appointmentId.slice(0, 8)}) has been updated`,
        type: NotificationType.APPOINTMENT,
      },
    });
  }

}

export const appointmentsService = new AppointmentsService();
