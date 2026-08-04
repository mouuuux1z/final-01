import { EntityStatus, DayOfWeek, UserType } from '@prisma/client';
import { AppError } from '../../utils/AppError.js';
import { buildPaginationMeta, parsePagination } from '../../utils/pagination.js';
import {
  addDaysLocal,
  dateToDayOfWeek,
  formatDateKey,
  generateSlotTimes,
  getAppointmentDateTime,
  isTimeInsideRange,
  normalizeDateOnly,
  normalizeTimeString,
  parseTimeToMinutes,
  slotsOverlap,
} from '../../utils/slotGenerator.js';
import { doctorsRepository } from './doctors.repository.js';
import { appointmentsRepository } from '../appointments/appointments.repository.js';
import type {
  GenerateAvailabilityInput,
  GenerateFromWeeklyScheduleInput,
  GenerateRecurringAvailabilityInput,
} from './doctors.schema.js';

export class DoctorsService {
  async search(query: Record<string, unknown>) {
    const pagination = parsePagination(query);
    const { items, total } = await doctorsRepository.findMany(
      {
        q: query.q as string | undefined,
        city: query.city as string | undefined,
        specialization: query.specialization as string | undefined,
        status: EntityStatus.ACTIVE,
      },
      pagination,
    );
    return { items, meta: buildPaginationMeta(pagination.page, pagination.limit, total) };
  }

  async adminSearch(query: Record<string, unknown>) {
    const pagination = parsePagination(query);
    const { items, total } = await doctorsRepository.findManyAdmin(
      {
        q: query.q as string | undefined,
        city: query.city as string | undefined,
        specialization: query.specialization as string | undefined,
        status: query.status as EntityStatus | undefined,
      },
      pagination,
    );
    return { items, meta: buildPaginationMeta(pagination.page, pagination.limit, total) };
  }

  async getProfile(id: string) {
    const doctor = await doctorsRepository.findByIdPublic(id);
    if (!doctor) throw new AppError('Doctor not found', 404);
    return doctor;
  }

  async getById(id: string) {
    const doctor = await doctorsRepository.findById(id);
    if (!doctor) throw new AppError('Doctor not found', 404);
    return doctor;
  }

  async updateProfile(doctorId: string, data: Record<string, unknown>, image?: string, certificate?: string) {
    const updateData: Record<string, unknown> = { ...data };
    if (image) updateData.image = image;
    if (certificate) updateData.certificate = certificate;
    return doctorsRepository.update(doctorId, updateData);
  }

  async adminUpdate(id: string, data: Record<string, unknown>) {
    const doctor = await doctorsRepository.findById(id);
    if (!doctor) throw new AppError('Doctor not found', 404);
    return doctorsRepository.update(id, data);
  }

  async deleteDoctor(id: string) {
    const doctor = await doctorsRepository.findById(id);
    if (!doctor) throw new AppError('Doctor not found', 404);
    await doctorsRepository.delete(id);
  }

  async setOnlineStatus(doctorId: string, isOnline: boolean) {
    return doctorsRepository.updateOnlineStatus(doctorId, isOnline);
  }

  async getSchedules(doctorId: string) {
    return doctorsRepository.getSchedules(doctorId);
  }

  async createSchedule(doctorId: string, data: { dayOfWeek: string; startTime: string; endTime: string }) {
    try {
      return await doctorsRepository.createSchedule(doctorId, data);
    } catch {
      throw new AppError('Schedule already exists for this day', 409);
    }
  }

  async updateSchedule(scheduleId: string, doctorId: string, data: { startTime?: string; endTime?: string }) {
    try {
      return await doctorsRepository.updateSchedule(scheduleId, doctorId, data);
    } catch {
      throw new AppError('Schedule not found', 404);
    }
  }

  async deleteSchedule(scheduleId: string, doctorId: string) {
    try {
      await doctorsRepository.deleteSchedule(scheduleId, doctorId);
    } catch {
      throw new AppError('Schedule not found', 404);
    }
  }

  async syncWeeklySchedules(
    doctorId: string,
    days: Array<{ dayOfWeek: string; startTime: string; endTime: string }>,
  ) {
    const enabledDays = new Set(days.map((day) => day.dayOfWeek));
    const existing = await doctorsRepository.getSchedules(doctorId);

    for (const day of days) {
      await doctorsRepository.upsertScheduleByDay(doctorId, day.dayOfWeek, {
        startTime: day.startTime,
        endTime: day.endTime,
      });
    }

    for (const schedule of existing) {
      if (!enabledDays.has(schedule.dayOfWeek)) {
        await doctorsRepository.deleteSchedule(schedule.id, doctorId);
      }
    }

    return doctorsRepository.getSchedules(doctorId);
  }

  async getAvailability(doctorId: string, filters: {
    date?: Date;
    from?: Date;
    to?: Date;
    availableOnly?: boolean;
  }) {
    return this.getPublicAvailability(doctorId, filters);
  }

  async getPublicAvailability(
    doctorId: string,
    filters: { date?: Date; from?: Date; to?: Date; availableOnly?: boolean },
  ) {
    const today = normalizeDateOnly(new Date());
    const from = filters.date
      ? normalizeDateOnly(filters.date)
      : filters.from
        ? normalizeDateOnly(filters.from)
        : today;
    const to = filters.date
      ? addDaysLocal(from, 1)
      : filters.to
        ? normalizeDateOnly(filters.to)
        : addDaysLocal(today, 60);

    const slots = await doctorsRepository.getAvailabilitySlots(doctorId, {
      date: filters.date ? from : undefined,
      from: filters.date ? undefined : from,
      to: filters.date ? undefined : to,
      availableOnly: filters.availableOnly,
      limit: 500,
    });

    const privateAppts = await appointmentsRepository.findActivePrivateAppointmentsForRange(
      doctorId,
      from,
      to,
    );

    const now = new Date();
    const activeSlots = this.excludeSlotsInsidePrivateRanges(
      slots.filter((slot) => {
        if (!slot.isBooked && getAppointmentDateTime(slot.date, slot.time) < now) {
          return false;
        }
        return true;
      }),
      privateAppts,
    );

    if (filters.availableOnly) {
      return activeSlots.filter((slot) => !slot.isBooked);
    }

    return activeSlots;
  }

  async createAvailabilitySlot(doctorId: string, date: Date, time: string) {
    try {
      return await doctorsRepository.createAvailabilitySlot(doctorId, date, time);
    } catch {
      throw new AppError('Slot already exists', 409);
    }
  }

  async bulkCreateAvailability(doctorId: string, date: Date, times: string[]) {
    return doctorsRepository.createManyAvailabilitySlots(doctorId, normalizeDateOnly(date), times);
  }

  async generateAvailability(doctorId: string, input: GenerateAvailabilityInput) {
    const date = normalizeDateOnly(input.date);
    const candidateTimes = generateSlotTimes({
      startTime: input.startTime,
      endTime: input.endTime,
      slotDurationMinutes: input.slotDurationMinutes,
      gapMinutes: input.gapMinutes ?? 0,
      breakStart: input.breakStart,
      breakEnd: input.breakEnd,
    });

    if (candidateTimes.length === 0) {
      throw new AppError('No slots could be generated with the provided settings', 400);
    }

    const existing = await doctorsRepository.getAvailabilitySlotsForDate(doctorId, date);
    const privateAppts = await appointmentsRepository.findActivePrivateAppointmentsForDate(doctorId, date);
    const duration = input.slotDurationMinutes;

    const filteredTimes = candidateTimes.filter((candidate) => {
      const candidateStart = parseTimeToMinutes(candidate);

      for (const priv of privateAppts) {
        const privStart = parseTimeToMinutes(normalizeTimeString(priv.time));
        const privEnd = priv.endTime
          ? parseTimeToMinutes(normalizeTimeString(priv.endTime))
          : privStart + 15;
        if (candidateStart >= privStart && candidateStart < privEnd) {
          return false;
        }
      }

      for (const slot of existing) {
        const existingStart = parseTimeToMinutes(slot.time);
        if (slot.time === candidate || slotsOverlap(candidateStart, duration, existingStart, duration)) {
          return false;
        }
      }

      return true;
    });

    if (filteredTimes.length === 0) {
      throw new AppError('All generated slots overlap with existing appointments', 409);
    }

    await doctorsRepository.createManyAvailabilitySlots(doctorId, date, filteredTimes);
    const slots = await doctorsRepository.getAvailabilitySlotsForDate(doctorId, date);

    return {
      createdCount: filteredTimes.length,
      skippedCount: candidateTimes.length - filteredTimes.length,
      slots,
    };
  }

  async generateRecurringAvailability(doctorId: string, input: GenerateRecurringAvailabilityInput) {
    const selectedDays = new Set(input.daysOfWeek);
    const candidateTimes = generateSlotTimes({
      startTime: input.startTime,
      endTime: input.endTime,
      slotDurationMinutes: input.slotDurationMinutes,
      gapMinutes: input.gapMinutes ?? 0,
      breakStart: input.breakStart,
      breakEnd: input.breakEnd,
    });

    if (candidateTimes.length === 0) {
      throw new AppError('No slots could be generated with the provided settings', 400);
    }

    for (const day of input.daysOfWeek) {
      await doctorsRepository.upsertScheduleByDay(doctorId, day, {
        startTime: input.startTime,
        endTime: input.endTime,
      });
    }

    const today = normalizeDateOnly(new Date());
    let totalCreated = 0;
    let totalSkipped = 0;
    const weeksAhead = input.weeksAhead ?? 8;
    const rangeEnd = addDaysLocal(today, weeksAhead * 7);
    const existingInRange = await doctorsRepository.getAvailabilitySlots(doctorId, {
      from: today,
      to: rangeEnd,
      limit: 5000,
    });
    const existingByDateKey = new Map<string, typeof existingInRange>();
    for (const slot of existingInRange) {
      const key = formatDateKey(slot.date);
      const bucket = existingByDateKey.get(key);
      if (bucket) {
        bucket.push(slot);
      } else {
        existingByDateKey.set(key, [slot]);
      }
    }

    const privateApptsInRange = await appointmentsRepository.findActivePrivateAppointmentsForRange(
      doctorId,
      today,
      rangeEnd,
    );
    const privateByDateKey = new Map<string, typeof privateApptsInRange>();
    for (const priv of privateApptsInRange) {
      const key = formatDateKey(priv.date);
      const bucket = privateByDateKey.get(key) ?? [];
      bucket.push(priv);
      privateByDateKey.set(key, bucket);
    }

    for (let offset = 0; offset < weeksAhead * 7; offset++) {
      const date = addDaysLocal(today, offset);
      const dayOfWeek = dateToDayOfWeek(date);

      if (!selectedDays.has(dayOfWeek)) continue;

      const normalizedDate = normalizeDateOnly(date);
      const dateKey = formatDateKey(normalizedDate);
      const existing = existingByDateKey.get(dateKey) ?? [];
      const datePrivates = privateByDateKey.get(dateKey) ?? [];
      const duration = input.slotDurationMinutes;

      const filteredTimes = candidateTimes.filter((candidate) => {
        const candidateStart = parseTimeToMinutes(candidate);
        for (const priv of datePrivates) {
          const privStart = parseTimeToMinutes(priv.time);
          const privEnd = priv.endTime ? parseTimeToMinutes(priv.endTime) : privStart + 15;
          if (candidateStart >= privStart && candidateStart < privEnd) {
            return false;
          }
        }
        for (const slot of existing) {
          const existingStart = parseTimeToMinutes(slot.time);
          if (slot.time === candidate || slotsOverlap(candidateStart, duration, existingStart, duration)) {
            return false;
          }
        }
        return true;
      });

      if (filteredTimes.length > 0) {
        await doctorsRepository.createManyAvailabilitySlots(doctorId, normalizedDate, filteredTimes);
        existing.push(...filteredTimes.map((time) => ({ time } as (typeof existing)[number])));
        totalCreated += filteredTimes.length;
      }
      totalSkipped += candidateTimes.length - filteredTimes.length;
    }

    return {
      createdCount: totalCreated,
      skippedCount: totalSkipped,
      daysProcessed: input.daysOfWeek.length,
      weeksAhead,
    };
  }

  async generateFromWeeklySchedule(doctorId: string, input: GenerateFromWeeklyScheduleInput) {
    const schedules = await doctorsRepository.getSchedules(doctorId);
    if (schedules.length === 0) {
      throw new AppError('No weekly schedule configured', 400);
    }

    const scheduleByDay = new Map(schedules.map((schedule) => [schedule.dayOfWeek, schedule]));
    const today = normalizeDateOnly(new Date());
    const rangeDays = input.daysAhead ?? 7;
    const rangeEnd = addDaysLocal(today, rangeDays);
    const duration = input.slotDurationMinutes ?? 30;

    const existingInRange = await doctorsRepository.getAvailabilitySlots(doctorId, {
      from: today,
      to: rangeEnd,
      limit: 5000,
    });
    const existingByDateKey = new Map<string, typeof existingInRange>();
    for (const slot of existingInRange) {
      const key = formatDateKey(slot.date);
      const bucket = existingByDateKey.get(key);
      if (bucket) {
        bucket.push(slot);
      } else {
        existingByDateKey.set(key, [slot]);
      }
    }

    const privateApptsInRange = await appointmentsRepository.findActivePrivateAppointmentsForRange(
      doctorId,
      today,
      rangeEnd,
    );
    const privateByDateKey = new Map<string, typeof privateApptsInRange>();
    for (const priv of privateApptsInRange) {
      const key = formatDateKey(priv.date);
      const bucket = privateByDateKey.get(key) ?? [];
      bucket.push(priv);
      privateByDateKey.set(key, bucket);
    }

    let totalCreated = 0;
    let totalSkipped = 0;
    let daysProcessed = 0;

    for (let offset = 0; offset < rangeDays; offset++) {
      const date = addDaysLocal(today, offset);
      const dayOfWeek = dateToDayOfWeek(date);
      const schedule = scheduleByDay.get(dayOfWeek);
      if (!schedule) continue;

      const candidateTimes = generateSlotTimes({
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        slotDurationMinutes: duration,
        gapMinutes: input.gapMinutes ?? 0,
        breakStart: input.breakStart,
        breakEnd: input.breakEnd,
      });

      if (candidateTimes.length === 0) continue;

      daysProcessed += 1;
      const normalizedDate = normalizeDateOnly(date);
      const dateKey = formatDateKey(normalizedDate);
      const existing = existingByDateKey.get(dateKey) ?? [];
      const datePrivates = privateByDateKey.get(dateKey) ?? [];

      const filteredTimes = candidateTimes.filter((candidate) => {
        const candidateStart = parseTimeToMinutes(candidate);
        for (const priv of datePrivates) {
          const privStart = parseTimeToMinutes(priv.time);
          const privEnd = priv.endTime ? parseTimeToMinutes(priv.endTime) : privStart + 15;
          if (candidateStart >= privStart && candidateStart < privEnd) {
            return false;
          }
        }
        for (const slot of existing) {
          const existingStart = parseTimeToMinutes(slot.time);
          if (slot.time === candidate || slotsOverlap(candidateStart, duration, existingStart, duration)) {
            return false;
          }
        }
        return true;
      });

      if (filteredTimes.length > 0) {
        await doctorsRepository.createManyAvailabilitySlots(doctorId, normalizedDate, filteredTimes);
        existing.push(...filteredTimes.map((time) => ({ time } as (typeof existing)[number])));
        totalCreated += filteredTimes.length;
      }
      totalSkipped += candidateTimes.length - filteredTimes.length;
    }

    if (totalCreated === 0 && daysProcessed === 0) {
      if (schedules.length === 0) {
        throw new AppError('No weekly schedule configured', 400);
      }
      throw new AppError(
        'No availability slots could be generated. Check that working hours are valid and end after start time.',
        400,
      );
    }

    return {
      createdCount: totalCreated,
      skippedCount: totalSkipped,
      daysProcessed,
      daysAhead: rangeDays,
    };
  }

  async getMyAvailability(
    doctorId: string,
    filters: { date?: Date; from?: Date; to?: Date; availableOnly?: boolean },
  ) {
    await this.purgeExpiredAvailabilitySlots(doctorId);

    const today = normalizeDateOnly(new Date());
    const from = filters.date
      ? normalizeDateOnly(filters.date)
      : filters.from
        ? normalizeDateOnly(filters.from)
        : today;
    const to = filters.date
      ? addDaysLocal(from, 1)
      : filters.to
        ? normalizeDateOnly(filters.to)
        : addDaysLocal(today, 60);

    const slots = await doctorsRepository.getAvailabilitySlots(doctorId, {
      date: filters.date ? from : undefined,
      from: filters.date ? undefined : from,
      to: filters.date ? undefined : to,
      availableOnly: filters.availableOnly,
      limit: 500,
    });

    const privateAppts = await appointmentsRepository.findActivePrivateAppointmentsForRange(
      doctorId,
      from,
      to,
    );

    const now = new Date();
    let activeSlots = slots.filter(
      (slot) => slot.isBooked || getAppointmentDateTime(slot.date, slot.time) >= now,
    );
    activeSlots = this.excludeSlotsInsidePrivateRanges(activeSlots, privateAppts);

    if (filters.availableOnly) {
      return activeSlots.filter((slot) => !slot.isBooked);
    }

    return activeSlots;
  }

  async listMyPatients(doctorId: string) {
    return doctorsRepository.listPatientsForDoctor(doctorId);
  }

  private excludeSlotsInsidePrivateRanges<T extends { date: Date; time: string }>(
    slots: T[],
    privateAppts: Array<{ date: Date; time: string; endTime: string | null }>,
  ): T[] {
    return slots.filter((slot) => {
      const slotDateKey = formatDateKey(slot.date);
      const isInsidePrivate = privateAppts.some((priv) => {
        if (formatDateKey(priv.date) !== slotDateKey) return false;
        if (!priv.endTime) {
          return normalizeTimeString(slot.time) === normalizeTimeString(priv.time);
        }
        return isTimeInsideRange(slot.time, priv.time, priv.endTime);
      });
      return !isInsidePrivate;
    });
  }

  private async purgeExpiredAvailabilitySlots(doctorId: string) {
    const today = normalizeDateOnly(new Date());
    const candidates = await doctorsRepository.getUnbookedSlotsUpToDate(doctorId, today);
    const now = new Date();
    const expiredIds = candidates
      .filter((slot) => getAppointmentDateTime(slot.date, slot.time) < now)
      .map((slot) => slot.id);

    await doctorsRepository.deleteAvailabilitySlotsByIds(expiredIds, doctorId);
  }

  async deleteAvailabilitySlot(slotId: string, doctorId: string) {
    try {
      await doctorsRepository.deleteAvailabilitySlot(slotId, doctorId);
    } catch {
      throw new AppError('Slot not found or already booked', 404);
    }
  }

  async bootstrapDefaultAvailability(doctorId: string) {
    const weekdays = [
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
    ];

    for (const day of weekdays) {
      await doctorsRepository.upsertScheduleByDay(doctorId, day, {
        startTime: '09:00',
        endTime: '17:00',
      });
    }

    const today = normalizeDateOnly(new Date());
    const defaultTimes = ['09:00', '10:00', '11:00', '14:00', '15:00'];

    for (let i = 0; i < 7; i++) {
      const date = addDaysLocal(today, i);
      await doctorsRepository.createManyAvailabilitySlots(doctorId, date, defaultTimes);
    }
  }

  assertDoctorAccess(userId: string, userType: UserType, doctorId: string) {
    if (userType === UserType.DOCTOR && userId !== doctorId) {
      throw new AppError('Forbidden', 403);
    }
  }
}

export const doctorsService = new DoctorsService();
