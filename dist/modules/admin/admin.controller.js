"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = exports.AdminController = void 0;
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const asyncHandler_js_1 = require("../../utils/asyncHandler.js");
const params_js_1 = require("../../utils/params.js");
const admin_service_js_1 = require("./admin.service.js");
const auth_service_js_1 = require("../auth/auth.service.js");
class AdminController {
    analytics = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const data = await admin_service_js_1.adminService.getAnalytics(req.query);
        (0, apiResponse_js_1.sendSuccess)(res, data);
    });
    listComplaints = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await admin_service_js_1.adminService.listComplaints(req.query);
        (0, apiResponse_js_1.sendSuccess)(res, result);
    });
    updateComplaint = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const admin = await auth_service_js_1.authService.getProfile(req.user.id, req.user.userType);
        const complaint = await admin_service_js_1.adminService.updateComplaint((0, params_js_1.parseIdParam)(req.params.id, 'id'), req.body.status, admin.name);
        (0, apiResponse_js_1.sendSuccess)(res, complaint, 'Complaint updated');
    });
    getSiteContent = (0, asyncHandler_js_1.asyncHandler)(async (_req, res) => {
        const content = await admin_service_js_1.adminService.getSiteContent();
        (0, apiResponse_js_1.sendSuccess)(res, content);
    });
    upsertSiteContent = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const admin = await auth_service_js_1.authService.getProfile(req.user.id, req.user.userType);
        const content = await admin_service_js_1.adminService.upsertSiteContent(req.body.key, req.body.value, admin.name);
        (0, apiResponse_js_1.sendSuccess)(res, content, 'Site content updated');
    });
    verifyDoctor = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const admin = await auth_service_js_1.authService.getProfile(req.user.id, req.user.userType);
        const doctor = await admin_service_js_1.adminService.verifyDoctor((0, params_js_1.parseIdParam)(req.params.id, 'id'), req.body.status, admin.name, req.body.disableReason);
        (0, apiResponse_js_1.sendSuccess)(res, doctor, 'Doctor verification updated');
    });
    createAdmin = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const admin = await auth_service_js_1.authService.getProfile(req.user.id, req.user.userType);
        const newAdmin = await admin_service_js_1.adminService.createAdmin(req.body, admin.name);
        (0, apiResponse_js_1.sendSuccess)(res, newAdmin, 'Admin created', 201);
    });
    listAdmins = (0, asyncHandler_js_1.asyncHandler)(async (_req, res) => {
        const admins = await admin_service_js_1.adminService.listAdmins();
        (0, apiResponse_js_1.sendSuccess)(res, admins);
    });
    listPendingDoctors = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await admin_service_js_1.adminService.listPendingDoctors(req.query);
        (0, apiResponse_js_1.sendSuccess)(res, result);
    });
}
exports.AdminController = AdminController;
exports.adminController = new AdminController();
//# sourceMappingURL=admin.controller.js.map