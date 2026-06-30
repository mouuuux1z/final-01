import { prisma } from '../../config/database.js';
import type { PaginationParams } from '../../utils/pagination.js';

export class PatientsRepository {
  async findById(id: string) {
    return prisma.patient.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        attendancePoints: true,
        bookingBlockedUntil: true,
        createdAt: true,
        _count: { select: { appointments: true } },
      },
    });
  }

  async update(id: string, data: { name?: string; phone?: string }) {
    return prisma.patient.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        attendancePoints: true,
        bookingBlockedUntil: true,
      },
    });
  }

  async findMany(pagination: PaginationParams) {
    const [items, total] = await Promise.all([
      prisma.patient.findMany({
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          attendancePoints: true,
          createdAt: true,
        },
      }),
      prisma.patient.count(),
    ]);
    return { items, total };
  }

  async updateStatus(id: string, status: string) {
    return prisma.patient.update({
      where: { id },
      data: { status: status as never },
      select: { id: true, name: true, email: true, status: true },
    });
  }
}

export const patientsRepository = new PatientsRepository();
