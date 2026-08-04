import type { DayOfWeek } from '@prisma/client';
import { APP_TZ_OFFSET_MINUTES } from '../config/timezone.js';

export const DEFAULT_SLOT_DURATION_MINUTES = 30;

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function normalizeTimeString(time: string): string {
  const trimmed = time.trim();
  const parts = trimmed.split(':');
  if (parts.length !== 2) return trimmed;
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return trimmed;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function slotsOverlap(
  startA: number,
  durationA: number,
  startB: number,
  durationB: number,
): boolean {
  return startA < startB + durationB && startA + durationA > startB;
}

export function generateSlotTimes(params: {
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  gapMinutes?: number;
  breakStart?: string;
  breakEnd?: string;
}): string[] {
  const {
    startTime,
    endTime,
    slotDurationMinutes,
    gapMinutes = 0,
    breakStart,
    breakEnd,
  } = params;

  const dayStart = parseTimeToMinutes(startTime);
  const dayEnd = parseTimeToMinutes(endTime);
  const breakStartMin = breakStart ? parseTimeToMinutes(breakStart) : null;
  const breakEndMin = breakEnd ? parseTimeToMinutes(breakEnd) : null;

  if (dayStart >= dayEnd) return [];
  if (breakStartMin !== null && breakEndMin !== null && breakStartMin >= breakEndMin) {
    return [];
  }

  const slots: string[] = [];
  let current = dayStart;

  while (current + slotDurationMinutes <= dayEnd) {
    const slotEnd = current + slotDurationMinutes;

    if (breakStartMin !== null && breakEndMin !== null) {
      const overlapsBreak = current < breakEndMin && slotEnd > breakStartMin;
      if (overlapsBreak) {
        current = breakEndMin + gapMinutes;
        continue;
      }
    }

    slots.push(formatMinutesToTime(current));
    current = slotEnd + gapMinutes;
  }

  return slots;
}

const JS_DAY_TO_WEEKDAY: DayOfWeek[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

export function dateToDayOfWeek(date: Date): DayOfWeek {
  return JS_DAY_TO_WEEKDAY[date.getDay()];
}

export function normalizeDateOnly(date: Date): Date {
  const key = formatDateKey(date);
  const match = key.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return date;
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0, 0));
}

/** Stable YYYY-MM-DD key for PostgreSQL DATE values (UTC calendar day). */
export function formatDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isTimeInsideRange(time: string, rangeStart: string, rangeEnd: string): boolean {
  const minute = parseTimeToMinutes(normalizeTimeString(time));
  const start = parseTimeToMinutes(normalizeTimeString(rangeStart));
  const end = parseTimeToMinutes(normalizeTimeString(rangeEnd));
  return minute >= start && minute < end;
}

export function parseLocalDateInput(input: unknown): Date | undefined {
  if (input === undefined || input === null || input === '') return undefined;
  if (input instanceof Date) {
    return normalizeDateOnly(input);
  }

  const str = String(input);
  const dateOnlyMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    return new Date(
      Date.UTC(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]), 12, 0, 0, 0),
    );
  }

  const prefixMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (prefixMatch) {
    return new Date(
      Date.UTC(Number(prefixMatch[1]), Number(prefixMatch[2]) - 1, Number(prefixMatch[3]), 12, 0, 0, 0),
    );
  }

  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return normalizeDateOnly(parsed);
}

export function addDaysLocal(date: Date, days: number): Date {
  const normalized = normalizeDateOnly(date);
  return new Date(
    Date.UTC(
      normalized.getUTCFullYear(),
      normalized.getUTCMonth(),
      normalized.getUTCDate() + days,
      12,
      0,
      0,
      0,
    ),
  );
}

export function addMinutesToTime(time: string, minutes: number): string {
  return formatMinutesToTime(parseTimeToMinutes(normalizeTimeString(time)) + minutes);
}

export function intervalsOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA < endB && endA > startB;
}

export function getAppointmentDateTime(date: Date, time: string): Date {
  const dateKey = formatDateKey(date);
  const match = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const safeTime = normalizeTimeString(time);
  const [hours, minutes] = safeTime.split(':').map(Number);
  const hour = Number.isFinite(hours) ? hours : 0;
  const minute = Number.isFinite(minutes) ? minutes : 0;

  if (!match) {
    return wallClockToUtcDate(
      ...(() => {
        const dateKey = formatDateKey(date);
        const parts = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!parts) return [1970, 0, 1] as const;
        return [Number(parts[1]), Number(parts[2]) - 1, Number(parts[3])] as const;
      })(),
      hour,
      minute,
    );
  }

  return wallClockToUtcDate(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    hour,
    minute,
  );
}

/** Converts calendar date + wall-clock time in APP timezone to a UTC Date. */
function wallClockToUtcDate(
  year: number,
  monthIndex: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  const utcMs =
    Date.UTC(year, monthIndex, day, hour, minute, 0, 0) - APP_TZ_OFFSET_MINUTES * 60 * 1000;
  return new Date(utcMs);
}

export function getAppointmentEndDateTime(
  date: Date,
  startTime: string,
  endTime?: string | null,
): Date {
  if (endTime && /^\d{1,2}:\d{2}/.test(endTime)) {
    return getAppointmentDateTime(date, endTime);
  }
  return getAppointmentDateTime(date, startTime);
}
