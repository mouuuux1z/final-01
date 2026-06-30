import { EntityStatus } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { AppError } from '../../utils/AppError.js';
import { buildPaginationMeta, parsePagination } from '../../utils/pagination.js';
import { ratingsRepository } from './ratings.repository.js';

export class RatingsService {
  async submit(patientId: string, doctorId: string, data: { rating: number; comment?: string }) {
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) throw new AppError('Patient not found', 404);
    if (patient.status !== EntityStatus.ACTIVE) throw new AppError('Account not active', 403);

    const doctor = await prisma.doctor.findFirst({
      where: { id: doctorId, status: EntityStatus.ACTIVE },
    });
    if (!doctor) throw new AppError('Doctor not found', 404);

    const eligible = await ratingsRepository.hasCompletedAppointment(patientId, doctorId);
    if (!eligible) {
      throw new AppError('You can only rate doctors after a completed appointment', 403);
    }

    const comment = data.comment?.trim() ? data.comment.trim() : undefined;
    const rating = await ratingsRepository.upsert(doctorId, patientId, data.rating, comment);
    const aggregate = await ratingsRepository.syncDoctorAggregate(doctorId);

    return { rating, aggregate };
  }

  async getMyRating(patientId: string, doctorId: string) {
    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) throw new AppError('Doctor not found', 404);

    const rating = await ratingsRepository.findByDoctorAndPatient(doctorId, patientId);
    const eligible = await ratingsRepository.hasCompletedAppointment(patientId, doctorId);

    return { rating, eligible };
  }

  async listByDoctor(doctorId: string, query: Record<string, unknown>) {
    const doctor = await prisma.doctor.findFirst({
      where: { id: doctorId, status: EntityStatus.ACTIVE },
    });
    if (!doctor) throw new AppError('Doctor not found', 404);

    const { page, limit, skip } = parsePagination(query);
    const { items, total } = await ratingsRepository.listByDoctor(doctorId, skip, limit);

    return {
      items: items.map((entry) => ({
        id: entry.id,
        rating: entry.rating,
        comment: entry.comment,
        createdAt: entry.createdAt,
        patientName: entry.patient.name,
      })),
      meta: buildPaginationMeta(page, limit, total),
    };
  }
}

export const ratingsService = new RatingsService();
