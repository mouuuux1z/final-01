"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentsController = exports.AppointmentsController = void 0;
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const asyncHandler_js_1 = require("../../utils/asyncHandler.js");
const params_js_1 = require("../../utils/params.js");
const appointments_service_js_1 = require("./appointments.service.js");
class AppointmentsController {
    book = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const appointment = await appointments_service_js_1.appointmentsService.book(req.user.id, req.body);
        (0, apiResponse_js_1.sendSuccess)(res, appointment, 'Appointment booked', 201);
    });
    list = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await appointments_service_js_1.appointmentsService.listForUser(req.user.id, req.user.userType, req.query);
        (0, apiResponse_js_1.sendSuccess)(res, result);
    });
    getById = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const appointment = await appointments_service_js_1.appointmentsService.getById((0, params_js_1.parseIdParam)(req.params.id, 'id'), req.user.id, req.user.userType);
        (0, apiResponse_js_1.sendSuccess)(res, appointment);
    });
    cancel = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const appointment = await appointments_service_js_1.appointmentsService.cancel((0, params_js_1.parseIdParam)(req.params.id, 'id'), req.user.id, req.user.userType);
        (0, apiResponse_js_1.sendSuccess)(res, appointment, 'Appointment cancelled');
    });
    reschedule = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const appointment = await appointments_service_js_1.appointmentsService.reschedule((0, params_js_1.parseIdParam)(req.params.id, 'id'), req.user.id, req.user.userType, req.body.date, req.body.time);
        (0, apiResponse_js_1.sendSuccess)(res, appointment, 'Appointment rescheduled');
    });
    accept = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const appointment = await appointments_service_js_1.appointmentsService.accept((0, params_js_1.parseIdParam)(req.params.id, 'id'), req.user.id);
        (0, apiResponse_js_1.sendSuccess)(res, appointment, 'Appointment accepted');
    });
    reject = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const appointment = await appointments_service_js_1.appointmentsService.reject((0, params_js_1.parseIdParam)(req.params.id, 'id'), req.user.id);
        (0, apiResponse_js_1.sendSuccess)(res, appointment, 'Appointment rejected');
    });
    doctorManualBook = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const appointment = await appointments_service_js_1.appointmentsService.doctorManualBook(req.user.id, req.body);
        (0, apiResponse_js_1.sendSuccess)(res, appointment, 'Manual booking created', 201);
    });
    markAttendance = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const appointment = await appointments_service_js_1.appointmentsService.markAttendance((0, params_js_1.parseIdParam)(req.params.id, 'id'), req.user.id, req.body.attendanceStatus);
        (0, apiResponse_js_1.sendSuccess)(res, appointment, 'Attendance updated');
    });
}
exports.AppointmentsController = AppointmentsController;
exports.appointmentsController = new AppointmentsController();
//# sourceMappingURL=appointments.controller.js.map