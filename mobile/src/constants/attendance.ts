export const ATTENDANCE_COMMITMENT_MAX = 3;
export const BOOKING_BLOCK_DAYS = 7;
export const ATTENDANCE_MARK_GRACE_MINUTES = 10;

export function normalizeCommitmentPoints(points?: number | null): number {
  if (points == null) return ATTENDANCE_COMMITMENT_MAX;
  return Math.min(ATTENDANCE_COMMITMENT_MAX, Math.max(0, points));
}

export function sortAppointmentsByQueue<T extends { date: string; time: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });
}

export function isActiveQueueAppointment(status: string): boolean {
  return !['CANCELLED', 'REJECTED'].includes(status);
}
