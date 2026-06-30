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
import { getAppointmentDateTime, normalizeDateOnly } from '../../utils/slotGenerator.js';
import { appointmentsRepository } from './appointments.repository.js';
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
    const filters: Parameters<typeof appointmentsRepository.findMany>[0] = {
      status: query.status as AppointmentStatus | undefined,
      from: query.from as Date | undefined,
      to: query.to as Date | undefined,
    };

    if (userType === UserType.PATIENT) filters.patientId = userId;
    if (userType === UserType.DOCTOR) filters.doctorId = userId;

    await this.processPastUnmarkedAppointments({
      patientId: filters.patientId,
      doctorId: filters.doctorId,
    });

    const pagination = parsePagination(query);
    const { items, total } = await appointmentsRepository.findMany(filters, pagination);
    return { items, meta: buildPaginationMeta(pagination.page, pagination.limit, total) };
  }

  async processPastUnmarkedAppointments(filters: { patientId?: string; doctorId?: string } = {}) {
    const where = {
      status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] as AppointmentStatus[] },
      attendanceStatus: { in: [AttendanceStatus.PENDING, AttendanceStatus.LATE] as AttendanceStatus[] },
      ...(filters.patientId ? { patientId: filters.patientId } : {}),
      ...(filters.doctorId ? { doctorId: filters.doctorId } : {}),
    };

    const candidates = await prisma.appointment.findMany({ where });
    const now = Date.now();

    for (const appointment of candidates) {
      const appointmentAt = getAppointmentDateTime(new Date(appointment.date), appointment.time);
      if (appointmentAt.getTime() > now) continue;

      await appointmentsRepository.updateAttendance(
        appointment.id,
        AttendanceStatus.ABSENT,
        AppointmentStatus.NO_SHOW,
      );

      const refreshed = await appointmentsRepository.findById(appointment.id);

      if (appointment.patientId) {
        await applyNoShowPenalty(appointment.patientId);
        await this.notifyPatientNoShow(appointment.patientId, appointment.id);
        emitToUser(UserType.PATIENT, appointment.patientId, SocketEvents.APPOINTMENT_UPDATED, refreshed);
        const patientProfile = await syncPatientCommitmentState(appointment.patientId);
        if (patientProfile) {
          emitToUser(UserType.PATIENT, appointment.patientId, SocketEvents.PATIENT_PROFILE_UPDATED, patientProfile);
        }
      }

      emitToUser(UserType.DOCTOR, appointment.doctorId, SocketEvents.APPOINTMENT_UPDATED, refreshed);
    }
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
      emitToUser(UserType.PATIENT, appointment.patientId!, SocketEvents.APPOINTMENT_UPDATED, result);
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

    if (
      appointment.status !== AppointmentStatus.CONFIRMED &&
      appointment.status !== AppointmentStatus.COMPLETED &&
      appointment.status !== AppointmentStatus.PENDING
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
    const graceMs = 15 * 60 * 1000;
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
      await applyNoShowPenalty(appointment.patientId);
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

  private assertAccess(
    appointment: { patientId: string | null; doctorId: string },
    userId: string,
    userType: UserType,
  ) {
    if (userType === UserType.ADMIN) return;
    if (userType === UserType.PATIENT && appointment.patientId !== userId) {
      throw new AppError('Forbidden', 403);
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

  private async notifyPatientNoShow(patientId: string, appointmentId: string) {
    await prisma.notification.create({
      data: {
        targetType: NotificationTargetType.PATIENT,
        targetId: patientId,
        title: 'Missed appointment',
        message: `You were marked absent for missing your appointment (#${appointmentId.slice(0, 8)}). One commitment point was deducted.`,
        type: NotificationType.APPOINTMENT,
      },
    });
  }
}

export const appointmentsService = new AppointmentsService();
