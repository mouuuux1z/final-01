import { AppointmentStatus, AttendanceStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import type { PaginationParams } from '../../utils/pagination.js';
import { addDaysLocal, normalizeDateOnly } from '../../utils/slotGenerator.js';

export class AppointmentsRepository {
  private dateOnlyRange(date: Date) {
    const start = normalizeDateOnly(date);
    return { gte: start, lt: addDaysLocal(start, 1) };
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
      status?: AppointmentStatus;
      from?: Date;
      to?: Date;
    },
    pagination: PaginationParams,
  ) {
    const where: Prisma.AppointmentWhereInput = {};
    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.doctorId) where.doctorId = filters.doctorId;
    if (filters.status) where.status = filters.status;
    if (filters.from || filters.to) {
      where.date = {};
      if (filters.from) (where.date as Prisma.DateTimeFilter).gte = filters.from;
      if (filters.to) (where.date as Prisma.DateTimeFilter).lte = filters.to;
    }

    const [items, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: [{ date: 'desc' }, { time: 'desc' }],
        include: {
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

      return tx.appointment.create({
        data: {
          ...data,
          date: normalizedDate,
          status: AppointmentStatus.PENDING,
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
        },
        include: {
          doctor: { select: { id: true, name: true, specialization: true } },
        },
      });
    });
  }

  async updateAttendance(id: string, attendanceStatus: string, status?: AppointmentStatus) {
    return prisma.appointment.update({
      where: { id },
      data: {
        attendanceStatus: attendanceStatus as never,
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
          date: appointment.date,
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
          date: appointment.date,
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
}

export const appointmentsRepository = new AppointmentsRepository();
