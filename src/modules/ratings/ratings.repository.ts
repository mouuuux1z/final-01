import { AppointmentStatus } from '@prisma/client';
import { prisma } from '../../config/database.js';

export class RatingsRepository {
  async findByDoctorAndPatient(doctorId: string, patientId: string) {
    return prisma.rating.findUnique({
      where: { doctorId_patientId: { doctorId, patientId } },
    });
  }

  async upsert(doctorId: string, patientId: string, rating: number, comment?: string | null) {
    return prisma.rating.upsert({
      where: { doctorId_patientId: { doctorId, patientId } },
      create: { doctorId, patientId, rating, comment: comment ?? null },
      update: { rating, comment: comment ?? null },
    });
  }

  async listByDoctor(doctorId: string, skip: number, limit: number) {
    const [items, total] = await Promise.all([
      prisma.rating.findMany({
        where: { doctorId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { patient: { select: { name: true } } },
      }),
      prisma.rating.count({ where: { doctorId } }),
    ]);
    return { items, total };
  }

  async syncDoctorAggregate(doctorId: string) {
    const agg = await prisma.rating.aggregate({
      where: { doctorId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const rating = agg._avg.rating ?? 0;
    const ratingCount = agg._count.rating;

    await prisma.doctor.update({
      where: { id: doctorId },
      data: { rating, ratingCount },
    });

    return { rating, ratingCount };
  }

  async hasCompletedAppointment(patientId: string, doctorId: string) {
    const count = await prisma.appointment.count({
      where: {
        patientId,
        doctorId,
        status: AppointmentStatus.COMPLETED,
      },
    });
    return count > 0;
  }
}

export const ratingsRepository = new RatingsRepository();
