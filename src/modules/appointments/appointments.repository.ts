import { AppointmentStatus, AttendanceStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import type { PaginationParams } from '../../utils/pagination.js';
import {
  DEFAULT_SLOT_DURATION_MINUTES,
  addDaysLocal,
  intervalsOverlap,
  normalizeDateOnly,
  normalizeTimeString,
  parseTimeToMinutes,
} from '../../utils/slotGenerator.js';
import { queueRepository } from '../queue/queue.repository.js';

export class AppointmentsRepository {
  private dateOnlyRange(date: Date) {
    const start = normalizeDateOnly(date);
    return { gte: start, lt: addDaysLocal(start, 1) };
  }

  async resolveSlotDurationMinutes(doctorId: string, date: Date, time: string): Promise<number> {
    const range = this.dateOnlyRange(date);
    const normalizedTime = normalizeTimeString(time);
    const slots = await prisma.doctorAvailabilitySlot.findMany({
      where: { doctorId, date: range },
      orderBy: { time: 'asc' },
      select: { time: true },
    });

    const slotIndex = slots.findIndex((slot) => normalizeTimeString(slot.time) === normalizedTime);
    if (slotIndex >= 0 && slotIndex < slots.length - 1) {
      const current = parseTimeToMinutes(slots[slotIndex].time);
      const next = parseTimeToMinutes(slots[slotIndex + 1].time);
      const diff = next - current;
      if (diff > 0 && diff <= 240) return diff;
    }

    return DEFAULT_SLOT_DURATION_MINUTES;
  }

  async findById(id: string) {
    return prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            phone: true,
            city: true,
            location: true,
            image: true,
          },
        },
        patient: {
          select: { id: true, name: true, email: true, phone: true, attendancePoints: true },
        },
      },
    });
  }

  async findMany(
    filters: {
      patientId?: string;
      doctorId?: string;
      status?: AppointmentStatus | AppointmentStatus[];
      isPrivate?: boolean;
      from?: Date;
      to?: Date;
      sort?: 'asc' | 'desc';
    },
    pagination: PaginationParams,
  ) {
    const where: Prisma.AppointmentWhereInput = {};
    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.doctorId) where.doctorId = filters.doctorId;
    if (filters.isPrivate !== undefined) where.isPrivate = filters.isPrivate;
    if (filters.status) {
      where.status = Array.isArray(filters.status) ? { in: filters.status } : filters.status;
    }
    if (filters.from || filters.to) {
      where.date = {};
      if (filters.from) (where.date as Prisma.DateTimeFilter).gte = filters.from;
      if (filters.to) (where.date as Prisma.DateTimeFilter).lte = filters.to;
    }

    const sortDir = filters.sort ?? 'desc';

    const [items, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: [{ date: sortDir }, { time: sortDir }],
        select: {
          id: true,
          doctorId: true,
          patientId: true,
          date: true,
          time: true,
          endTime: true,
          isPrivate: true,
          status: true,
          attendanceStatus: true,
          notes: true,
          patientName: true,
          patientPhone: true,
          queueNumber: true,
          createdAt: true,
          doctor: { select: { id: true, name: true, specialization: true, image: true } },
          patient: { select: { id: true, name: true, phone: true, attendancePoints: true } },
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    return { items, total };
  }

  async create(data: {
    doctorId: string;
    patientId: string;
    date: Date;
    time: string;
    notes?: string;
    patientName?: string;
    patientPhone?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const normalizedDate = normalizeDateOnly(data.date);
      const slot = await tx.doctorAvailabilitySlot.findFirst({
        where: {
          doctorId: data.doctorId,
          date: this.dateOnlyRange(normalizedDate),
          time: data.time,
          isBooked: false,
        },
      });
      if (!slot) throw new Error('SLOT_UNAVAILABLE');

      await tx.doctorAvailabilitySlot.update({
        where: { id: slot.id },
        data: { isBooked: true },
      });

      const queueNumber = await queueRepository.assignNextQueueNumber(
        data.doctorId,
        normalizedDate,
        false,
        tx,
      );

      return tx.appointment.create({
        data: {
          ...data,
          date: normalizedDate,
          status: AppointmentStatus.PENDING,
          queueNumber,
        },
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              specialization: true,
              phone: true,
              city: true,
              location: true,
              image: true,
            },
          },
          patient: { select: { id: true, name: true, phone: true } },
        },
      });
    });
  }

  async updateStatus(id: string, status: AppointmentStatus) {
    return prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        doctor: { select: { id: true, name: true } },
        patient: { select: { id: true, name: true } },
      },
    });
  }

  async createDoctorManual(data: {
    doctorId: string;
    patientName: string;
    patientPhone?: string;
    date: Date;
    time: string;
    notes?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const normalizedDate = normalizeDateOnly(data.date);
      const slot = await tx.doctorAvailabilitySlot.findFirst({
        where: {
          doctorId: data.doctorId,
          date: this.dateOnlyRange(normalizedDate),
          time: data.time,
          isBooked: false,
        },
      });
      if (!slot) throw new Error('SLOT_UNAVAILABLE');

      await tx.doctorAvailabilitySlot.update({
        where: { id: slot.id },
        data: { isBooked: true },
      });

      const queueNumber = await queueRepository.assignNextQueueNumber(
        data.doctorId,
        normalizedDate,
        false,
        tx,
      );

      return tx.appointment.create({
        data: {
          doctorId: data.doctorId,
          patientId: null,
          patientName: data.patientName,
          patientPhone: data.patientPhone,
          date: normalizedDate,
          time: data.time,
          notes: data.notes,
          status: AppointmentStatus.CONFIRMED,
          attendanceStatus: AttendanceStatus.PENDING,
          queueNumber,
        },
        include: {
          doctor: { select: { id: true, name: true, specialization: true } },
        },
      });
    });
  }

  async updateAttendance(id: string, attendanceStatus: AttendanceStatus, status?: AppointmentStatus) {
    return prisma.appointment.update({
      where: { id },
      data: {
        attendanceStatus,
        ...(status ? { status } : {}),
      },
      include: {
        doctor: { select: { id: true, name: true } },
        patient: { select: { id: true, name: true, phone: true } },
      },
    });
  }

  async cancel(id: string) {
    return prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.findUnique({ where: { id } });
      if (!appointment) throw new Error('NOT_FOUND');

      await tx.doctorAvailabilitySlot.updateMany({
        where: {
          doctorId: appointment.doctorId,
          date: this.dateOnlyRange(appointment.date),
          time: appointment.time,
        },
        data: { isBooked: false },
      });

      return tx.appointment.update({
        where: { id },
        data: { status: AppointmentStatus.CANCELLED },
        include: {
          doctor: { select: { id: true, name: true } },
          patient: { select: { id: true, name: true } },
        },
      });
    });
  }

  async reject(id: string) {
    return prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.findUnique({ where: { id } });
      if (!appointment) throw new Error('NOT_FOUND');

      await tx.doctorAvailabilitySlot.updateMany({
        where: {
          doctorId: appointment.doctorId,
          date: this.dateOnlyRange(appointment.date),
          time: appointment.time,
        },
        data: { isBooked: false },
      });

      return tx.appointment.update({
        where: { id },
        data: { status: AppointmentStatus.REJECTED },
        include: {
          doctor: { select: { id: true, name: true } },
          patient: { select: { id: true, name: true } },
        },
      });
    });
  }

  async reschedule(id: string, date: Date, time: string) {
    return prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.findUnique({ where: { id } });
      if (!appointment) throw new Error('NOT_FOUND');

      const normalizedDate = normalizeDateOnly(date);
      const newSlot = await tx.doctorAvailabilitySlot.findFirst({
        where: {
          doctorId: appointment.doctorId,
          date: this.dateOnlyRange(normalizedDate),
          time,
          isBooked: false,
        },
      });
      if (!newSlot) throw new Error('SLOT_UNAVAILABLE');

      await tx.doctorAvailabilitySlot.updateMany({
        where: {
          doctorId: appointment.doctorId,
          date: this.dateOnlyRange(appointment.date),
          time: appointment.time,
        },
        data: { isBooked: false },
      });

      await tx.doctorAvailabilitySlot.update({
        where: { id: newSlot.id },
        data: { isBooked: true },
      });

      return tx.appointment.update({
        where: { id },
        data: { date: normalizedDate, time, status: AppointmentStatus.PENDING },
        include: {
          doctor: { select: { id: true, name: true } },
        },
      });
    });
  }

  async findActivePrivateAppointmentsForDate(doctorId: string, date: Date) {
    const range = this.dateOnlyRange(date);
    return prisma.appointment.findMany({
      where: {
        doctorId,
        isPrivate: true,
        date: range,
        status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.REJECTED] },
      },
    });
  }

  async findActiveByPatient(patientId: string, excludeId?: string) {
    return prisma.appointment.findMany({
      where: {
        patientId,
        isPrivate: false,
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            phone: true,
            city: true,
            location: true,
            image: true,
          },
        },
        patient: {
          select: { id: true, name: true, email: true, phone: true, attendancePoints: true },
        },
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });
  }

  async findActivePrivateAppointmentsForRange(doctorId: string, from: Date, to: Date) {
    return prisma.appointment.findMany({
      where: {
        doctorId,
        isPrivate: true,
        date: { gte: normalizeDateOnly(from), lte: normalizeDateOnly(to) },
        status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.REJECTED] },
      },
    });
  }

  async findConflictingPrivate(
    doctorId: string,
    date: Date,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ) {
    const activePrivates = await this.findActivePrivateAppointmentsForDate(doctorId, date);
    const startMin = parseTimeToMinutes(startTime);
    const endMin = parseTimeToMinutes(endTime);

    return activePrivates.find((item) => {
      if (excludeId && item.id === excludeId) return false;
      const itemStart = parseTimeToMinutes(item.time);
      const itemEnd = item.endTime
        ? parseTimeToMinutes(item.endTime)
        : itemStart + DEFAULT_SLOT_DURATION_MINUTES;
      return intervalsOverlap(startMin, endMin, itemStart, itemEnd);
    });
  }

  async findConflictingBookedRegular(
    doctorId: string,
    date: Date,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ) {
    const range = this.dateOnlyRange(date);
    const regularAppts = await prisma.appointment.findMany({
      where: {
        doctorId,
        isPrivate: false,
        date: range,
        status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.REJECTED] },
      },
    });

    const startMin = parseTimeToMinutes(startTime);
    const endMin = parseTimeToMinutes(endTime);

    return regularAppts.find((item) => {
      if (excludeId && item.id === excludeId) return false;
      const regStart = parseTimeToMinutes(item.time);
      const regEnd = regStart + DEFAULT_SLOT_DURATION_MINUTES;
      return intervalsOverlap(startMin, endMin, regStart, regEnd);
    });
  }

  async createPrivate(data: {
    doctorId: string;
    patientId?: string;
    patientName?: string;
    patientPhone?: string;
    date: Date;
    startTime: string;
    endTime: string;
    notes?: string;
  }) {
    const normalizedDate = normalizeDateOnly(data.date);
    return prisma.appointment.create({
      data: {
        doctorId: data.doctorId,
        patientId: data.patientId || null,
        patientName: data.patientName || null,
        patientPhone: data.patientPhone || null,
        date: normalizedDate,
        time: data.startTime,
        endTime: data.endTime,
        isPrivate: true,
        notes: data.notes || null,
        status: AppointmentStatus.CONFIRMED,
        attendanceStatus: AttendanceStatus.PENDING,
      },
      include: {
        doctor: { select: { id: true, name: true, specialization: true } },
        patient: { select: { id: true, name: true, phone: true } },
      },
    });
  }

  async updatePrivate(
    id: string,
    data: {
      patientId?: string;
      patientName?: string;
      patientPhone?: string;
      date: Date;
      startTime: string;
      endTime: string;
      notes?: string;
    },
  ) {
    const normalizedDate = normalizeDateOnly(data.date);
    return prisma.appointment.update({
      where: { id },
      data: {
        patientId: data.patientId || null,
        patientName: data.patientName || null,
        patientPhone: data.patientPhone || null,
        date: normalizedDate,
        time: data.startTime,
        endTime: data.endTime,
        notes: data.notes || null,
      },
      include: {
        doctor: { select: { id: true, name: true, specialization: true } },
        patient: { select: { id: true, name: true, phone: true } },
      },
    });
  }

  async deletePrivate(id: string) {
    return prisma.appointment.delete({
      where: { id },
    });
  }
}

export const appointmentsRepository = new AppointmentsRepository();
