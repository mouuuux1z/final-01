"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = exports.AdminService = void 0;
const client_1 = require("@prisma/client");
const AppError_js_1 = require("../../utils/AppError.js");
const activityLog_js_1 = require("../../utils/activityLog.js");
const pagination_js_1 = require("../../utils/pagination.js");
const password_js_1 = require("../../utils/password.js");
const admin_repository_js_1 = require("./admin.repository.js");
const auth_repository_js_1 = require("../auth/auth.repository.js");
class AdminService {
    async getAnalytics(query) {
        return admin_repository_js_1.adminRepository.getAnalytics(query.from, query.to);
    }
    async listComplaints(query) {
        const pagination = (0, pagination_js_1.parsePagination)(query);
        const { items, total } = await admin_repository_js_1.adminRepository.listComplaints(pagination, query.status);
        return { items, meta: (0, pagination_js_1.buildPaginationMeta)(pagination.page, pagination.limit, total) };
    }
    async updateComplaint(id, status, adminName) {
        const complaint = await admin_repository_js_1.adminRepository.updateComplaint(id, status);
        await (0, activityLog_js_1.logActivity)('UPDATE_COMPLAINT', adminName, `Complaint ${id} -> ${status}`);
        return complaint;
    }
    async getSiteContent() {
        return admin_repository_js_1.adminRepository.getSiteContent();
    }
    async upsertSiteContent(key, value, adminName) {
        const content = await admin_repository_js_1.adminRepository.upsertSiteContent(key, value);
        await (0, activityLog_js_1.logActivity)('UPDATE_SITE_CONTENT', adminName, `Key: ${key}`);
        return content;
    }
    async verifyDoctor(id, status, adminName, disableReason) {
        const doctor = await admin_repository_js_1.adminRepository.verifyDoctor(id, status, disableReason);
        await (0, activityLog_js_1.logActivity)('VERIFY_DOCTOR', adminName, `Doctor ${id} -> ${status}`);
        return doctor;
    }
    async createAdmin(data, adminName) {
        const existingAdmins = await admin_repository_js_1.adminRepository.listAdmins();
        if (existingAdmins.length > 0) {
            throw new AppError_js_1.AppError('Admin account creation is disabled', 403);
        }
        const exists = await auth_repository_js_1.authRepository.emailExists(client_1.UserType.ADMIN, data.email);
        if (exists)
            throw new AppError_js_1.AppError('Email already registered', 409);
        const passwordHash = await (0, password_js_1.hashPassword)(data.password);
        const admin = await admin_repository_js_1.adminRepository.createAdmin({ ...data, password: passwordHash });
        await (0, activityLog_js_1.logActivity)('CREATE_ADMIN', adminName, `Admin ${admin.email}`);
        return admin;
    }
    async listAdmins() {
        return admin_repository_js_1.adminRepository.listAdmins();
    }
    async listPendingDoctors(query) {
        const pagination = (0, pagination_js_1.parsePagination)(query);
        const { items, total } = await admin_repository_js_1.adminRepository.listPendingDoctors(pagination);
        return { items, meta: (0, pagination_js_1.buildPaginationMeta)(pagination.page, pagination.limit, total) };
    }
}
exports.AdminService = AdminService;
exports.adminService = new AdminService();
//# sourceMappingURL=admin.service.js.map