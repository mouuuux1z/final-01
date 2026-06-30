"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratingsRepository = exports.RatingsRepository = void 0;
const client_1 = require("@prisma/client");
const database_js_1 = require("../../config/database.js");
class RatingsRepository {
    async findByDoctorAndPatient(doctorId, patientId) {
        return database_js_1.prisma.rating.findUnique({
            where: { doctorId_patientId: { doctorId, patientId } },
        });
    }
    async upsert(doctorId, patientId, rating, comment) {
        return database_js_1.prisma.rating.upsert({
            where: { doctorId_patientId: { doctorId, patientId } },
            create: { doctorId, patientId, rating, comment: comment ?? null },
            update: { rating, comment: comment ?? null },
        });
    }
    async listByDoctor(doctorId, skip, limit) {
        const [items, total] = await Promise.all([
            database_js_1.prisma.rating.findMany({
                where: { doctorId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { patient: { select: { name: true } } },
            }),
            database_js_1.prisma.rating.count({ where: { doctorId } }),
        ]);
        return { items, total };
    }
    async syncDoctorAggregate(doctorId) {
        const agg = await database_js_1.prisma.rating.aggregate({
            where: { doctorId },
            _avg: { rating: true },
            _count: { rating: true },
        });
        const rating = agg._avg.rating ?? 0;
        const ratingCount = agg._count.rating;
        await database_js_1.prisma.doctor.update({
            where: { id: doctorId },
            data: { rating, ratingCount },
        });
        return { rating, ratingCount };
    }
    async hasCompletedAppointment(patientId, doctorId) {
        const count = await database_js_1.prisma.appointment.count({
            where: {
                patientId,
                doctorId,
                status: client_1.AppointmentStatus.COMPLETED,
            },
        });
        return count > 0;
    }
}
exports.RatingsRepository = RatingsRepository;
exports.ratingsRepository = new RatingsRepository();
//# sourceMappingURL=ratings.repository.js.map