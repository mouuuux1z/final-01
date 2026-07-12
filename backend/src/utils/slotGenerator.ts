import type { DayOfWeek } from '@prisma/client';

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
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
}

export function parseLocalDateInput(input: unknown): Date | undefined {
  if (input === undefined || input === null || input === '') return undefined;
  if (input instanceof Date) {
    return normalizeDateOnly(input);
  }

  const str = String(input);
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return normalizeDateOnly(date);
  }

  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return normalizeDateOnly(parsed);
}

export function addDaysLocal(date: Date, days: number): Date {
  const result = normalizeDateOnly(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getAppointmentDateTime(date: Date, time: string): Date {
  const source = new Date(date);
  const appointmentAt = new Date(
    source.getFullYear(),
    source.getMonth(),
    source.getDate(),
    0,
    0,
    0,
    0,
  );
  const [hours, minutes] = time.split(':').map(Number);
  appointmentAt.setHours(hours, minutes, 0, 0);
  return appointmentAt;
}
