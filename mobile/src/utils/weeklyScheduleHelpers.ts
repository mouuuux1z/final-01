import type { DayOfWeek, DoctorSchedule } from '../types';

export const WEEK_DAYS: DayOfWeek[] = [
  'SATURDAY',
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
];

export interface WeeklyDayDraft {
  enabled: boolean;
  startTime: string;
  endTime: string;
  scheduleId?: string;
}

export type WeeklyScheduleDraft = Record<DayOfWeek, WeeklyDayDraft>;

export function createEmptyWeeklyScheduleDraft(): WeeklyScheduleDraft {
  return WEEK_DAYS.reduce((acc, day) => {
    acc[day] = { enabled: false, startTime: '09:00', endTime: '17:00' };
    return acc;
  }, {} as WeeklyScheduleDraft);
}

export function weeklyScheduleDraftFromRecords(schedules: DoctorSchedule[]): WeeklyScheduleDraft {
  const draft = createEmptyWeeklyScheduleDraft();
  for (const schedule of schedules) {
    draft[schedule.dayOfWeek] = {
      enabled: true,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      scheduleId: schedule.id,
    };
  }
  return draft;
}

export function normalizeTimeInput(time: string): string {
  const trimmed = time.trim();
  const parts = trimmed.split(':');
  if (parts.length !== 2) return trimmed;
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return trimmed;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function isValidTimeRange(startTime: string, endTime: string): boolean {
  const [sh, sm] = normalizeTimeInput(startTime).split(':').map(Number);
  const [eh, em] = normalizeTimeInput(endTime).split(':').map(Number);
  return sh * 60 + sm < eh * 60 + em;
}
