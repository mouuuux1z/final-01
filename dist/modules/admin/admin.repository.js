"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRepository = exports.AdminRepository = void 0;
const client_1 = require("@prisma/client");
const database_js_1 = require("../../config/database.js");
class AdminRepository {
    async getAnalytics(from, to) {
        const dateFilter = {};
        if (from || to) {
            dateFilter.date = {};
            if (from)
                dateFilter.date.gte = from;
            if (to)
                dateFilter.date.lte = to;
        }
        const [totalPatients, totalDoctors, totalClinics, totalAppointments, pendingDoctors, pendingClinics, appointmentsByStatus, recentActivity,] = await Promise.all([
            database_js_1.prisma.patient.count({ where: { status: client_1.EntityStatus.ACTIVE } }),
            database_js_1.prisma.doctor.count({ where: { status: client_1.EntityStatus.ACTIVE } }),
            database_js_1.prisma.clinic.count({ where: { status: client_1.EntityStatus.ACTIVE } }),
            database_js_1.prisma.appointment.count({ where: dateFilter }),
            database_js_1.prisma.doctor.count({ where: { status: client_1.EntityStatus.PENDING } }),
            database_js_1.prisma.clinic.count({ where: { status: client_1.EntityStatus.PENDING } }),
            database_js_1.prisma.appointment.groupBy({
                by: ['status'],
                where: dateFilter,
                _count: { status: true },
            }),
            database_js_1.prisma.activityLog.findMany({
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
    async listComplaints(pagination, status) {
        const where = status ? { status } : {};
        const [items, total] = await Promise.all([
            database_js_1.prisma.complaint.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { createdAt: 'desc' },
            }),
            database_js_1.prisma.complaint.count({ where }),
        ]);
        return { items, total };
    }
    async updateComplaint(id, status) {
        return database_js_1.prisma.complaint.update({ where: { id }, data: { status } });
    }
    async getSiteContent() {
        return database_js_1.prisma.siteContent.findMany({ orderBy: { key: 'asc' } });
    }
    async upsertSiteContent(key, value) {
        return database_js_1.prisma.siteContent.upsert({
            where: { key },
            create: { key, value },
            update: { value },
        });
    }
    async verifyDoctor(id, status, disableReason) {
        return database_js_1.prisma.doctor.update({
            where: { id },
            data: { status, disableReason: disableReason ?? null },
            select: { id: true, name: true, email: true, status: true, disableReason: true },
        });
    }
    async createAdmin(data) {
        return database_js_1.prisma.admin.create({
            data: data,
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });
    }
    async listAdmins() {
        return database_js_1.prisma.admin.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async listPendingDoctors(pagination) {
        const where = { status: client_1.EntityStatus.PENDING };
        const [items, total] = await Promise.all([
            database_js_1.prisma.doctor.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { createdAt: 'desc' },
            }),
            database_js_1.prisma.doctor.count({ where }),
        ]);
        return { items, total };
    }
    async getAppointmentStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return database_js_1.prisma.appointment.count({
            where: {
                date: { gte: today, lt: tomorrow },
                status: { in: [client_1.AppointmentStatus.PENDING, client_1.AppointmentStatus.CONFIRMED] },
            },
        });
    }
}
exports.AdminRepository = AdminRepository;
exports.adminRepository = new AdminRepository();
//# sourceMappingURL=admin.repository.js.map