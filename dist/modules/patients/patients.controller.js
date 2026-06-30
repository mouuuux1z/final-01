"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientsController = exports.PatientsController = void 0;
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const asyncHandler_js_1 = require("../../utils/asyncHandler.js");
const params_js_1 = require("../../utils/params.js");
const patients_service_js_1 = require("./patients.service.js");
class PatientsController {
    getMe = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const patient = await patients_service_js_1.patientsService.getProfile(req.user.id);
        (0, apiResponse_js_1.sendSuccess)(res, patient);
    });
    updateMe = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const patient = await patients_service_js_1.patientsService.updateProfile(req.user.id, req.body);
        (0, apiResponse_js_1.sendSuccess)(res, patient, 'Profile updated');
    });
    adminList = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await patients_service_js_1.patientsService.listAll(req.query);
        (0, apiResponse_js_1.sendSuccess)(res, result);
    });
    adminGet = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const patient = await patients_service_js_1.patientsService.getProfile((0, params_js_1.parseIdParam)(req.params.id, 'id'));
        (0, apiResponse_js_1.sendSuccess)(res, patient);
    });
    adminUpdateStatus = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const patient = await patients_service_js_1.patientsService.updateStatus((0, params_js_1.parseIdParam)(req.params.id, 'id'), req.body.status);
        (0, apiResponse_js_1.sendSuccess)(res, patient, 'Patient status updated');
    });
}
exports.PatientsController = PatientsController;
exports.patientsController = new PatientsController();
//# sourceMappingURL=patients.controller.js.map