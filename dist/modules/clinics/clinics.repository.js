"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clinicsRepository = exports.ClinicsRepository = void 0;
const client_1 = require("@prisma/client");
const database_js_1 = require("../../config/database.js");
const doctorSelect = {
    id: true,
    name: true,
    email: true,
    specialization: true,
    phone: true,
    city: true,
    location: true,
    status: true,
    isOnline: true,
    serialNumber: true,
    rating: true,
    ratingCount: true,
    disableReason: true,
    description: true,
    createdAt: true,
};
class ClinicsRepository {
    async findById(id) {
        return database_js_1.prisma.clinic.findUnique({
            where: { id },
            include: {
                doctors: {
                    select: doctorSelect,
                    orderBy: { createdAt: 'asc' },
                },
                _count: { select: { doctors: true } },
            },
        });
    }
    async update(id, data) {
        return database_js_1.prisma.clinic.update({
            where: { id },
            data: data,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                location: true,
                city: true,
                specialization: true,
                certificate: true,
                status: true,
                createdAt: true,
            },
        });
    }
    async findMany(pagination, status) {
        const where = status ? { status } : {};
        const [items, total] = await Promise.all([
            database_js_1.prisma.clinic.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    location: true,
                    city: true,
                    specialization: true,
                    certificate: true,
                    status: true,
                    createdAt: true,
                    _count: { select: { doctors: true } },
                },
            }),
            database_js_1.prisma.clinic.count({ where }),
        ]);
        return { items, total };
    }
    async findDoctorById(doctorId) {
        return database_js_1.prisma.doctor.findUnique({
            where: { id: doctorId },
            select: { id: true, clinicId: true, email: true, status: true },
        });
    }
    async createDoctor(data) {
        return database_js_1.prisma.$transaction(async (tx) => {
            const doctor = await tx.doctor.create({
                data: {
                    ...data,
                    status: client_1.EntityStatus.ACTIVE,
                },
                select: doctorSelect,
            });
            return doctor;
        });
    }
    async assignDoctor(clinicId, doctorId) {
        return database_js_1.prisma.doctor.update({
            where: { id: doctorId },
            data: { clinicId },
            select: doctorSelect,
        });
    }
    async updateDoctorStatus(clinicId, doctorId, status, disableReason) {
        return database_js_1.prisma.doctor.updateMany({
            where: { id: doctorId, clinicId },
            data: {
                status,
                disableReason: status === client_1.EntityStatus.DISABLED ? disableReason ?? null : null,
                ...(status === client_1.EntityStatus.DISABLED ? { isOnline: false } : {}),
            },
        });
    }
    async getDoctorInClinic(clinicId, doctorId) {
        return database_js_1.prisma.doctor.findFirst({
            where: { id: doctorId, clinicId },
            select: doctorSelect,
        });
    }
    async removeDoctor(clinicId, doctorId) {
        return database_js_1.prisma.doctor.updateMany({
            where: { id: doctorId, clinicId },
            data: { clinicId: null },
        });
    }
    async getNextDoctorSerialNumber() {
        const count = await database_js_1.prisma.doctor.count();
        const year = new Date().getFullYear();
        return `DOC-${year}-${String(count + 1).padStart(3, '0')}`;
    }
    async emailExists(email) {
        const doctor = await database_js_1.prisma.doctor.findUnique({ where: { email } });
        return doctor !== null;
    }
}
exports.ClinicsRepository = ClinicsRepository;
exports.clinicsRepository = new ClinicsRepository();
//# sourceMappingURL=clinics.repository.js.map