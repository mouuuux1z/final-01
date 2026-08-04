import type { TFunction } from 'i18next';
import type { DayOfWeek } from '../types';
import { ATTENDANCE_MARK_GRACE_MINUTES, isActiveQueueAppointment } from '../constants/attendance';
import { APP_TZ_OFFSET_MINUTES } from '../constants/config';

const JS_DAY_TO_DAY_OF_WEEK: Record<number, DayOfWeek> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
};

/** Tunisian / Maghrebi month names */
const ARABIC_MONTHS = [
  'جانفي',
  'فيفري',
  'مارس',
  'أفريل',
  'ماي',
  'جوان',
  'جويلية',
  'أوت',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

export function parseLocalDateKey(dateKey: string): Date {
  const match = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0, 0);
  }

  const parsed = new Date(dateKey);
  if (Number.isNaN(parsed.getTime())) {
    return new Date(NaN);
  }

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 12, 0, 0, 0);
}

export function getNextLocalDays(count: number, startOffset = 0): string[] {
  const days: string[] = [];
  const today = new Date();

  for (let i = startOffset; i < startOffset + count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(toDateInputValue(date));
  }

  return days;
}

export function getDayOfWeekFromDateKey(dateKey: string): DayOfWeek {
  const date = parseLocalDateKey(dateKey);
  return JS_DAY_TO_DAY_OF_WEEK[date.getDay()];
}

export function getDayChipLabels(
  dateKey: string,
  t: TFunction,
  language: string,
): { dayNumber: string; weekday: string; month: string } {
  const date = parseLocalDateKey(dateKey);
  if (Number.isNaN(date.getTime())) {
    return { dayNumber: dateKey, weekday: '', month: '' };
  }

  const dayOfWeek = JS_DAY_TO_DAY_OF_WEEK[date.getDay()];
  const weekday = t(`doctor.days.${dayOfWeek}` as never);
  const dayNumber = String(date.getDate());
  const month =
    language.startsWith('ar')
      ? ARABIC_MONTHS[date.getMonth()]
      : date.toLocaleDateString(language.startsWith('fr') ? 'fr-FR' : 'en-US', { month: 'short' });

  return { dayNumber, weekday, month };
}

export function formatAppointmentDate(dateStr: string, language?: string): string {
  const dateKey = getAppointmentDateKey(dateStr);
  const date = parseLocalDateKey(dateKey);
  if (Number.isNaN(date.getTime())) return dateStr;

  if (language?.startsWith('ar')) {
    return `${date.getDate()} ${ARABIC_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  }

  return date.toLocaleDateString(language?.startsWith('fr') ? 'fr-FR' : undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatBookingReference(appointmentId: string): string {
  return appointmentId.replace(/-/g, '').slice(0, 8).toUpperCase();
}

export function buildAppointmentQrPayload(appointmentId: string): string {
  return `MYDOC:${appointmentId}`;
}

export function isAppointmentPast(dateStr: string, time: string): boolean {
  return getAppointmentDateTime(dateStr, time) <= new Date();
}

export function isAttendanceMarkingAvailable(
  dateStr: string,
  time: string,
  graceMinutes = ATTENDANCE_MARK_GRACE_MINUTES,
  now = new Date(),
): boolean {
  const appointmentAt = getAppointmentDateTime(dateStr, time);
  const opensAt = appointmentAt.getTime() - graceMinutes * 60 * 1000;
  return now.getTime() >= opensAt;
}

export function isAppointmentUpcoming(dateStr: string, time: string, now = new Date()): boolean {
  return getAppointmentDateTime(dateStr, time) > now;
}

export function isTerminalAppointmentStatus(status: string): boolean {
  return ['CANCELLED', 'COMPLETED', 'REJECTED', 'NO_SHOW'].includes(status);
}

export function isDoctorQueueAppointment(
  appointment: { status: string; attendanceStatus: string },
): boolean {
  if (['CANCELLED', 'REJECTED', 'COMPLETED', 'NO_SHOW'].includes(appointment.status)) {
    return false;
  }
  if (!isActiveQueueAppointment(appointment.status)) return false;
  return appointment.attendanceStatus === 'PENDING' || appointment.attendanceStatus === 'LATE';
}

export function toDateInputValue(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getAppointmentDateKey(dateStr: string): string {
  if (!dateStr) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  const parsed = new Date(dateStr);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getUTCFullYear();
    const m = String(parsed.getUTCMonth() + 1).padStart(2, '0');
    const d = String(parsed.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const prefixMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
  return prefixMatch?.[1] ?? dateStr.split('T')[0] ?? dateStr;
}

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

export function getAppointmentDateTime(dateStr: string, time: string): Date {
  const dateKey = getAppointmentDateKey(dateStr);
  const match = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const safeTime = typeof time === 'string' && /^\d{1,2}:\d{2}/.test(time) ? time : '00:00';
  const [hours, minutes] = safeTime.split(':').map(Number);
  const hour = Number.isFinite(hours) ? hours : 0;
  const minute = Number.isFinite(minutes) ? minutes : 0;

  if (!match) {
    const today = toDateInputValue();
    const fallback = today.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!fallback) {
      return wallClockToUtcDate(1970, 0, 1, hour, minute);
    }
    return wallClockToUtcDate(Number(fallback[1]), Number(fallback[2]) - 1, Number(fallback[3]), hour, minute);
  }

  return wallClockToUtcDate(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    hour,
    minute,
  );
}

export function getAppointmentEndDateTime(dateStr: string, startTime: string, endTime?: string | null): Date {
  if (endTime && /^\d{1,2}:\d{2}/.test(endTime)) {
    return getAppointmentDateTime(dateStr, endTime);
  }
  return getAppointmentDateTime(dateStr, startTime);
}

export function isAppointmentEnded(
  appointment: { date: string; time: string; endTime?: string | null },
  now = new Date(),
): boolean {
  return getAppointmentEndDateTime(appointment.date, appointment.time, appointment.endTime) <= now;
}

export function attendanceLabelKey(
  status: string,
  options?: { date?: string; time?: string },
): string {
  if (
    (status === 'PENDING' || status === 'LATE') &&
    options?.date &&
    options?.time &&
    isAppointmentPast(options.date, options.time)
  ) {
    return 'doctor.attendanceAwaitingDoctor';
  }

  switch (status) {
    case 'ATTENDED':
      return 'doctor.attendanceAttended';
    case 'ABSENT':
      return 'doctor.attendanceAbsent';
    case 'LATE':
      return 'doctor.attendanceLate';
    default:
      return 'doctor.attendancePending';
  }
}

export function attendanceColor(status: string): string {
  switch (status) {
    case 'ATTENDED':
      return '#16A34A';
    case 'ABSENT':
      return '#DC2626';
    case 'LATE':
      return '#F59E0B';
    default:
      return '#64748B';
  }
}
