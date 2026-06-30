"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientsRepository = exports.PatientsRepository = void 0;
const database_js_1 = require("../../config/database.js");
class PatientsRepository {
    async findById(id) {
        return database_js_1.prisma.patient.findUnique({
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
    async update(id, data) {
        return database_js_1.prisma.patient.update({
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
    async findMany(pagination) {
        const [items, total] = await Promise.all([
            database_js_1.prisma.patient.findMany({
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
            database_js_1.prisma.patient.count(),
        ]);
        return { items, total };
    }
    async updateStatus(id, status) {
        return database_js_1.prisma.patient.update({
            where: { id },
            data: { status: status },
            select: { id: true, name: true, email: true, status: true },
        });
    }
}
exports.PatientsRepository = PatientsRepository;
exports.patientsRepository = new PatientsRepository();
//# sourceMappingURL=patients.repository.js.map