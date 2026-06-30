"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const asyncHandler_js_1 = require("../../utils/asyncHandler.js");
const upload_middleware_js_1 = require("../../middleware/upload.middleware.js");
const auth_service_js_1 = require("./auth.service.js");
class AuthController {
    register = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await auth_service_js_1.authService.register(req.body);
        const message = result.pendingApproval
            ? 'Registration submitted and pending admin approval'
            : 'Registration successful';
        (0, apiResponse_js_1.sendSuccess)(res, result, message, 201);
    });
    registerDoctor = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const file = req.file;
        if (!file?.filename) {
            res.status(400).json({ success: false, message: 'Practice license certificate is required' });
            return;
        }
        const certificate = (0, upload_middleware_js_1.getFileUrl)(file.filename);
        const result = await auth_service_js_1.authService.registerDoctor({ ...req.body, certificate });
        (0, apiResponse_js_1.sendSuccess)(res, result, 'Registration submitted and pending admin approval', 201);
    });
    registerClinic = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const file = req.file;
        if (!file?.filename) {
            res.status(400).json({ success: false, message: 'Clinic license certificate is required' });
            return;
        }
        const certificate = (0, upload_middleware_js_1.getFileUrl)(file.filename);
        const result = await auth_service_js_1.authService.registerClinic({ ...req.body, certificate });
        (0, apiResponse_js_1.sendSuccess)(res, result, 'Registration submitted and pending admin approval', 201);
    });
    login = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const ipAddress = req.ip ?? req.socket.remoteAddress;
        const result = await auth_service_js_1.authService.login(req.body, ipAddress);
        (0, apiResponse_js_1.sendSuccess)(res, result, 'Login successful');
    });
    logout = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const header = req.headers.authorization;
        const token = header?.startsWith('Bearer ') ? header.slice(7) : '';
        if (token) {
            await auth_service_js_1.authService.logout(token);
        }
        (0, apiResponse_js_1.sendSuccess)(res, null, 'Logged out successfully');
    });
    me = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const user = await auth_service_js_1.authService.getProfile(req.user.id, req.user.userType);
        (0, apiResponse_js_1.sendSuccess)(res, user);
    });
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map