import {
  AppointmentStatus,
  ComplaintStatus,
  EntityStatus,
  Prisma,
} from '@prisma/client';
import { prisma } from '../../config/database.js';
import type { PaginationParams } from '../../utils/pagination.js';

export class AdminRepository {
  async getAnalytics(from?: Date, to?: Date) {
    const dateFilter: Prisma.AppointmentWhereInput = {};
    if (from || to) {
      dateFilter.date = {};
      if (from) (dateFilter.date as Prisma.DateTimeFilter).gte = from;
      if (to) (dateFilter.date as Prisma.DateTimeFilter).lte = to;
    }

    const [
      totalPatients,
      totalDoctors,
      totalClinics,
      totalAppointments,
      pendingDoctors,
      pendingClinics,
      appointmentsByStatus,
      recentActivity,
    ] = await Promise.all([
      prisma.patient.count({ where: { status: EntityStatus.ACTIVE } }),
      prisma.doctor.count({ where: { status: EntityStatus.ACTIVE } }),
      prisma.clinic.count({ where: { status: EntityStatus.ACTIVE } }),
      prisma.appointment.count({ where: dateFilter }),
      prisma.doctor.count({ where: { status: EntityStatus.PENDING } }),
      prisma.clinic.count({ where: { status: EntityStatus.PENDING } }),
      prisma.appointment.groupBy({
        by: ['status'],
        where: dateFilter,
        _count: { status: true },
      }),
      prisma.activityLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      totals: {
        patients: totalPatients,
        doctors: totalDoctors,
        clinics: totalClinics,
        appointments: totalAppointments,
        pendingDoctors,
        pendingClinics,
      },
      appointmentsByStatus: appointmentsByStatus.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      recentActivity,
    };
  }

  async listComplaints(pagination: PaginationParams, status?: ComplaintStatus) {
    const where: Prisma.ComplaintWhereInput = status ? { status } : {};
    const [items, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.complaint.count({ where }),
    ]);
    return { items, total };
  }

  async updateComplaint(id: string, status: ComplaintStatus) {
    return prisma.complaint.update({ where: { id }, data: { status } });
  }

  async getSiteContent() {
    return prisma.siteContent.findMany({ orderBy: { key: 'asc' } });
  }

  async upsertSiteContent(key: string, value: string) {
    return prisma.siteContent.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  async verifyDoctor(id: string, status: EntityStatus, disableReason?: string | null) {
    return prisma.doctor.update({
      where: { id },
      data: { status, disableReason: disableReason ?? null },
      select: { id: true, name: true, email: true, status: true, disableReason: true },
    });
  }

  async createAdmin(data: { name: string; email: string; password: string; role?: string }) {
    return prisma.admin.create({
      data: data as never,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  }

  async listAdmins() {
    return prisma.admin.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listPendingDoctors(pagination: PaginationParams) {
    const where = { status: EntityStatus.PENDING };
    const [items, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.doctor.count({ where }),
    ]);
    return { items, total };
  }

  async getAppointmentStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return prisma.appointment.count({
      where: {
        date: { gte: today, lt: tomorrow },
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      },
    });
  }
}

export const adminRepository = new AdminRepository();
