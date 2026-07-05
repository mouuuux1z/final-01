import type { Doctor, DoctorUser } from '../types';

type DoctorWithClinic = Pick<DoctorUser, 'location'> & {
  clinic?: { location?: string | null } | null;
};

export function getDoctorDisplayLocation(doctor: DoctorWithClinic): string | null {
  const value = doctor.location?.trim() || doctor.clinic?.location?.trim();
  return value || null;
}

export function getDoctorLocationLabel(doctor: Doctor | DoctorUser): string {
  const parts = [doctor.city?.trim(), getDoctorDisplayLocation(doctor)].filter(Boolean);
  return parts.join(' · ');
}
