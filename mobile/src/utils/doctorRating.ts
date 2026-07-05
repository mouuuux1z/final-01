export function formatDoctorRatingLabel(rating?: number): string {
  return `★ ${(rating ?? 0).toFixed(1)}`;
}
