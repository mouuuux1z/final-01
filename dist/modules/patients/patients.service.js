"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientsService = exports.PatientsService = void 0;
const AppError_js_1 = require("../../utils/AppError.js");
const pagination_js_1 = require("../../utils/pagination.js");
const patients_repository_js_1 = require("./patients.repository.js");
class PatientsService {
    async getProfile(patientId) {
        const patient = await patients_repository_js_1.patientsRepository.findById(patientId);
        if (!patient)
            throw new AppError_js_1.AppError('Patient not found', 404);
        return patient;
    }
    async updateProfile(patientId, data) {
        return patients_repository_js_1.patientsRepository.update(patientId, data);
    }
    async listAll(query) {
        const pagination = (0, pagination_js_1.parsePagination)(query);
        const { items, total } = await patients_repository_js_1.patientsRepository.findMany(pagination);
        return { items, meta: (0, pagination_js_1.buildPaginationMeta)(pagination.page, pagination.limit, total) };
    }
    async updateStatus(id, status) {
        const patient = await patients_repository_js_1.patientsRepository.findById(id);
        if (!patient)
            throw new AppError_js_1.AppError('Patient not found', 404);
        return patients_repository_js_1.patientsRepository.updateStatus(id, status);
    }
}
exports.PatientsService = PatientsService;
exports.patientsService = new PatientsService();
//# sourceMappingURL=patients.service.js.map