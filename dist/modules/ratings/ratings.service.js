"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratingsService = exports.RatingsService = void 0;
const client_1 = require("@prisma/client");
const database_js_1 = require("../../config/database.js");
const AppError_js_1 = require("../../utils/AppError.js");
const pagination_js_1 = require("../../utils/pagination.js");
const ratings_repository_js_1 = require("./ratings.repository.js");
class RatingsService {
    async submit(patientId, doctorId, data) {
        const patient = await database_js_1.prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient)
            throw new AppError_js_1.AppError('Patient not found', 404);
        if (patient.status !== client_1.EntityStatus.ACTIVE)
            throw new AppError_js_1.AppError('Account not active', 403);
        const doctor = await database_js_1.prisma.doctor.findFirst({
            where: { id: doctorId, status: client_1.EntityStatus.ACTIVE },
        });
        if (!doctor)
            throw new AppError_js_1.AppError('Doctor not found', 404);
        const eligible = await ratings_repository_js_1.ratingsRepository.hasCompletedAppointment(patientId, doctorId);
        if (!eligible) {
            throw new AppError_js_1.AppError('You can only rate doctors after a completed appointment', 403);
        }
        const comment = data.comment?.trim() ? data.comment.trim() : undefined;
        const rating = await ratings_repository_js_1.ratingsRepository.upsert(doctorId, patientId, data.rating, comment);
        const aggregate = await ratings_repository_js_1.ratingsRepository.syncDoctorAggregate(doctorId);
        return { rating, aggregate };
    }
    async getMyRating(patientId, doctorId) {
        const doctor = await database_js_1.prisma.doctor.findUnique({ where: { id: doctorId } });
        if (!doctor)
            throw new AppError_js_1.AppError('Doctor not found', 404);
        const rating = await ratings_repository_js_1.ratingsRepository.findByDoctorAndPatient(doctorId, patientId);
        const eligible = await ratings_repository_js_1.ratingsRepository.hasCompletedAppointment(patientId, doctorId);
        return { rating, eligible };
    }
    async listByDoctor(doctorId, query) {
        const doctor = await database_js_1.prisma.doctor.findFirst({
            where: { id: doctorId, status: client_1.EntityStatus.ACTIVE },
        });
        if (!doctor)
            throw new AppError_js_1.AppError('Doctor not found', 404);
        const { page, limit, skip } = (0, pagination_js_1.parsePagination)(query);
        const { items, total } = await ratings_repository_js_1.ratingsRepository.listByDoctor(doctorId, skip, limit);
        return {
            items: items.map((entry) => ({
                id: entry.id,
                rating: entry.rating,
                comment: entry.comment,
                createdAt: entry.createdAt,
                patientName: entry.patient.name,
            })),
            meta: (0, pagination_js_1.buildPaginationMeta)(page, limit, total),
        };
    }
}
exports.RatingsService = RatingsService;
exports.ratingsService = new RatingsService();
//# sourceMappingURL=ratings.service.js.map