import { api } from './api';
import type { ApiResponse, ClinicUser, DoctorUser, PatientUser } from '../types';

export interface UpdatePatientProfileInput {
  name?: string;
  phone?: string;
}

export interface UpdateDoctorProfileInput {
  name?: string;
  phone?: string;
  specialization?: string;
  city?: string;
  location?: string;
  clinicInfo?: string;
  description?: string;
}

export interface UpdateClinicProfileInput {
  name?: string;
  location?: string;
  phone?: string;
  city?: string;
  specialization?: string;
}

export async function updatePatientProfile(input: UpdatePatientProfileInput): Promise<PatientUser> {
  const { data } = await api.patch<ApiResponse<PatientUser>>('/patients/me', input);
  return data.data;
}

export async function updateDoctorProfile(input: UpdateDoctorProfileInput): Promise<DoctorUser> {
  const { data } = await api.patch<ApiResponse<DoctorUser>>('/doctor/me', input);
  return data.data;
}

export async function updateClinicProfile(input: UpdateClinicProfileInput): Promise<ClinicUser> {
  const { data } = await api.patch<ApiResponse<ClinicUser>>('/clinics/me', input);
  return data.data;
}
