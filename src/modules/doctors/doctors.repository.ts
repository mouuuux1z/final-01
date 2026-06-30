import { EntityStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { addDaysLocal, normalizeDateOnly } from '../../utils/slotGenerator.js';
import { textContains } from '../../utils/prismaFilters.js';
import type { PaginationParams } from '../../utils/pagination.js';

export class DoctorsRepository {
  async findMany(
    filters: { q?: string; city?: string; specialization?: string; status?: EntityStatus },
    pagination: PaginationParams,
  ) {
    const where: Prisma.DoctorWhereInput = {
      status: filters.status ?? EntityStatus.ACTIVE,
    };

    if (filters.city) where.city = textContains(filters.city);
    if (filters.specialization) {
      const terms = filters.specialization
        .split('|')
        .map((term) => term.trim())
        .filter(Boolean);
      if (terms.length === 1) {
        where.specialization = textContains(terms[0]);
      } else if (terms.length > 1) {
        const specFilter: Prisma.DoctorWhereInput = {
          OR: terms.map((term) => ({ specialization: textContains(term) })),
        };
        where.AND = Array.isArray(where.AND)
          ? [...where.AND, specFilter]
          : where.AND
            ? [where.AND, specFilter]
            : [specFilter];
      }
    }
    if (filters.q) {
      where.OR = [
        { name: textContains(filters.q) },
        { specialization: textContains(filters.q) },
        { city: textContains(filters.q) },
        { location: textContains(filters.q) },
        { clinic: { name: textContains(filters.q) } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { rating: 'desc' },
        select: {
          id: true,
          serialNumber: true,
          name: true,
          email: true,
          specialization: true,
          phone: true,
          city: true,
          description: true,
          image: true,
          location: true,
          rating: true,
          ratingCount: true,
          status: true,
          isOnline: true,
          clinicId: true,
          clinic: { select: { id: true, name: true, location: true } },
        },
      }),
      prisma.doctor.count({ where }),
    ]);

    return { items, total };
  }

  async findManyAdmin(
    filters: { q?: string; city?: string; specialization?: string; status?: EntityStatus },
    pagination: PaginationParams,
  ) {
    const where: Prisma.DoctorWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.city) where.city = textContains(filters.city);
    if (filters.specialization) {
      const terms = filters.specialization
        .split('|')
        .map((term) => term.trim())
        .filter(Boolean);
      if (terms.length === 1) {
        where.specialization = textContains(terms[0]);
      } else if (terms.length > 1) {
        const specFilter: Prisma.DoctorWhereInput = {
          OR: terms.map((term) => ({ specialization: textContains(term) })),
        };
        where.AND = Array.isArray(where.AND)
          ? [...where.AND, specFilter]
          : where.AND
            ? [where.AND, specFilter]
            : [specFilter];
      }
    }
    if (filters.q) {
      where.OR = [
        { name: textContains(filters.q) },
        { email: textContains(filters.q) },
        { specialization: textContains(filters.q) },
        { city: textContains(filters.q) },
        { location: textContains(filters.q) },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          serialNumber: true,
          name: true,
          email: true,
          specialization: true,
          phone: true,
          city: true,
          description: true,
          image: true,
          location: true,
          rating: true,
          ratingCount: true,
          status: true,
          isOnline: true,
          disableReason: true,
          clinicId: true,
          createdAt: true,
          clinic: { select: { id: true, name: true, location: true } },
        },
      }),
      prisma.doctor.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return prisma.doctor.findUnique({
      where: { id },
      include: {
        clinic: { select: { id: true, name: true, location: true, phone: true } },
        schedules: true,
        chatSettings: true,
        _count: { select: { appointments: true, ratings: true } },
      },
    });
  }

  async findByIdPublic(id: string) {
    return prisma.doctor.findFirst({
      where: { id, status: EntityStatus.ACTIVE },
      select: {
        id: true,
        serialNumber: true,
        name: true,
        specialization: true,
        phone: true,
        city: true,
        location: true,
        clinicInfo: true,
        description: true,
        image: true,
        rating: true,
        ratingCount: true,
        isOnline: true,
        clinic: { select: { id: true, name: true, location: true } },
        schedules: true,
      },
    });
  }

  async update(id: string, data: Prisma.DoctorUpdateInput) {
    return prisma.doctor.update({
      where: { id },
      data,
      select: {
        id: true,
        serialNumber: true,
        name: true,
        email: true,
        specialization: true,
        phone: true,
        city: true,
        location: true,
        description: true,
        image: true,
        certificate: true,
        status: true,
        isOnline: true,
        lastActive: true,
        clinicId: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.doctor.delete({ where: { id } });
  }

  async updateOnlineStatus(id: string, isOnline: boolean) {
    return prisma.doctor.update({
      where: { id },
      data: { isOnline, lastActive: new Date() },
      select: { id: true, isOnline: true, lastActive: true },
    });
  }

  async getSchedules(doctorId: string) {
    return prisma.doctorSchedule.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async createSchedule(doctorId: string, data: { dayOfWeek: string; startTime: string; endTime: string }) {
    return prisma.doctorSchedule.create({ data: { doctorId, ...data } as never });
  }

  async updateSchedule(scheduleId: string, doctorId: string, data: { startTime?: string; endTime?: string }) {
    return prisma.doctorSchedule.update({
      where: { id: scheduleId, doctorId },
      data,
    });
  }

  async upsertScheduleByDay(
    doctorId: string,
    dayOfWeek: string,
    data: { startTime: string; endTime: string },
  ) {
    return prisma.doctorSchedule.upsert({
      where: { doctorId_dayOfWeek: { doctorId, dayOfWeek: dayOfWeek as never } },
      create: { doctorId, dayOfWeek: dayOfWeek as never, ...data },
      update: data,
    });
  }

  async deleteSchedule(scheduleId: string, doctorId: string) {
    return prisma.doctorSchedule.delete({ where: { id: scheduleId, doctorId } });
  }

  async getAvailabilitySlots(doctorId: string, filters: { date?: Date; from?: Date; to?: Date }) {
    const where: Prisma.DoctorAvailabilitySlotWhereInput = { doctorId };
    if (filters.date) {
      const start = normalizeDateOnly(filters.date);
      const end = addDaysLocal(start, 1);
      where.date = { gte: start, lt: end };
    } else if (filters.from || filters.to) {
      where.date = {};
      if (filters.from) (where.date as Prisma.DateTimeFilter).gte = filters.from;
      if (filters.to) (where.date as Prisma.DateTimeFilter).lte = filters.to;
    }

    return prisma.doctorAvailabilitySlot.findMany({
      where,
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });
  }

  async createAvailabilitySlot(doctorId: string, date: Date, time: string) {
    return prisma.doctorAvailabilitySlot.create({
      data: { doctorId, date, time },
    });
  }

  async createManyAvailabilitySlots(doctorId: string, date: Date, times: string[]) {
    const normalizedDate = normalizeDateOnly(date);
    if (times.length === 0) {
      return { count: 0 };
    }

    const existing = await this.getAvailabilitySlotsForDate(doctorId, normalizedDate);
    const existingTimes = new Set(existing.map((slot) => slot.time));
    const uniqueTimes = [...new Set(times)].filter((time) => !existingTimes.has(time));

    if (uniqueTimes.length === 0) {
      return { count: 0 };
    }

    return prisma.doctorAvailabilitySlot.createMany({
      data: uniqueTimes.map((time) => ({ doctorId, date: normalizedDate, time })),
    });
  }

  async getAvailabilitySlotsForDate(doctorId: string, date: Date) {
    const start = normalizeDateOnly(date);
    const end = addDaysLocal(start, 1);
    return prisma.doctorAvailabilitySlot.findMany({
      where: {
        doctorId,
        date: { gte: start, lt: end },
      },
      orderBy: { time: 'asc' },
    });
  }

  async deleteAvailabilitySlot(slotId: string, doctorId: string) {
    return prisma.doctorAvailabilitySlot.delete({
      where: { id: slotId, doctorId, isBooked: false },
    });
  }

  async getUnbookedSlotsUpToDate(doctorId: string, upToDate: Date) {
    return prisma.doctorAvailabilitySlot.findMany({
      where: {
        doctorId,
        isBooked: false,
        date: { lte: upToDate },
      },
      select: { id: true, date: true, time: true },
    });
  }

  async deleteAvailabilitySlotsByIds(ids: string[], doctorId: string) {
    if (ids.length === 0) {
      return { count: 0 };
    }

    return prisma.doctorAvailabilitySlot.deleteMany({
      where: {
        id: { in: ids },
        doctorId,
        isBooked: false,
      },
    });
  }

  async findDoctorsByClinic(clinicId: string) {
    return prisma.doctor.findMany({
      where: { clinicId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const doctorsRepository = new DoctorsRepository();
