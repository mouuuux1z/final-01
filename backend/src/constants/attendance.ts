export const ATTENDANCE_COMMITMENT_MAX = 3;
export const ATTENDANCE_COMMITMENT_DEDUCTION = 1;
export const BOOKING_BLOCK_DAYS = 7;
/** Doctor may mark attendance starting this many minutes before the appointment. */
export const ATTENDANCE_MARK_GRACE_MINUTES = 10;

export function normalizeCommitmentPoints(points: number | null | undefined): number {
  if (points == null) return ATTENDANCE_COMMITMENT_MAX;
  return Math.min(ATTENDANCE_COMMITMENT_MAX, Math.max(0, points));
}
