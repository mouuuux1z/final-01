import { api } from './api';
import type { ApiResponse, DoctorRating, DoctorRatingAggregate, PaginatedResponse, PatientRatingStatus } from '../types';

export interface SubmitDoctorRatingInput {
  rating: number;
  comment?: string;
}

export async function submitDoctorRating(
  doctorId: string,
  input: SubmitDoctorRatingInput,
): Promise<{ rating: DoctorRating; aggregate: DoctorRatingAggregate }> {
  const { data } = await api.post<ApiResponse<{ rating: DoctorRating; aggregate: DoctorRatingAggregate }>>(
    `/doctors/${doctorId}/ratings`,
    input,
  );
  return data.data;
}

export async function getMyRatingForDoctor(doctorId: string): Promise<PatientRatingStatus> {
  const { data } = await api.get<ApiResponse<PatientRatingStatus>>(`/doctors/${doctorId}/ratings/me`);
  return data.data;
}

export async function getDoctorRatings(
  doctorId: string,
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<DoctorRatingListItem>> {
  const { data } = await api.get<ApiResponse<PaginatedResponse<DoctorRatingListItem>>>(
    `/doctors/${doctorId}/ratings`,
    { params: { page, limit } },
  );

  const payload = data.data;
  if (!payload?.meta || !Array.isArray(payload.items)) {
    return {
      items: [],
      meta: { page: 1, limit, total: 0, totalPages: 1 },
    };
  }

  return payload;
}

export interface DoctorRatingListItem {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  patientName: string;
}
