"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clinicsController = exports.ClinicsController = void 0;
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const asyncHandler_js_1 = require("../../utils/asyncHandler.js");
const params_js_1 = require("../../utils/params.js");
const upload_middleware_js_1 = require("../../middleware/upload.middleware.js");
const auth_service_js_1 = require("../auth/auth.service.js");
const clinics_service_js_1 = require("./clinics.service.js");
class ClinicsController {
    getMe = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const clinic = await clinics_service_js_1.clinicsService.getProfile(req.user.id);
        (0, apiResponse_js_1.sendSuccess)(res, clinic);
    });
    updateMe = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const clinic = await clinics_service_js_1.clinicsService.updateProfile(req.user.id, req.body);
        (0, apiResponse_js_1.sendSuccess)(res, clinic, 'Clinic updated');
    });
    createDoctor = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const file = req.file;
        if (!file?.filename) {
            res.status(400).json({ success: false, message: 'Practice license certificate is required' });
            return;
        }
        const certificate = (0, upload_middleware_js_1.getFileUrl)(file.filename);
        const doctor = await clinics_service_js_1.clinicsService.createDoctor(req.user.id, { ...req.body, certificate });
        (0, apiResponse_js_1.sendSuccess)(res, doctor, 'Doctor created', 201);
    });
    assignDoctor = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const doctor = await clinics_service_js_1.clinicsService.assignDoctor(req.user.id, req.body.doctorId);
        (0, apiResponse_js_1.sendSuccess)(res, doctor, 'Doctor assigned');
    });
    updateDoctorStatus = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const doctor = await clinics_service_js_1.clinicsService.updateDoctorStatus(req.user.id, (0, params_js_1.parseIdParam)(req.params.doctorId, 'doctorId'), req.body);
        (0, apiResponse_js_1.sendSuccess)(res, doctor, 'Doctor status updated');
    });
    removeDoctor = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        await clinics_service_js_1.clinicsService.removeDoctor(req.user.id, (0, params_js_1.parseIdParam)(req.params.doctorId, 'doctorId'));
        (0, apiResponse_js_1.sendSuccess)(res, null, 'Doctor removed');
    });
    getDoctorAppointments = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await clinics_service_js_1.clinicsService.getDoctorAppointments(req.user.id, (0, params_js_1.parseIdParam)(req.params.doctorId, 'doctorId'), req.query);
        (0, apiResponse_js_1.sendSuccess)(res, result);
    });
    getDoctorAvailability = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const slots = await clinics_service_js_1.clinicsService.getDoctorAvailability(req.user.id, (0, params_js_1.parseIdParam)(req.params.doctorId, 'doctorId'), req.query);
        (0, apiResponse_js_1.sendSuccess)(res, slots);
    });
    getDoctorSchedules = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const schedules = await clinics_service_js_1.clinicsService.getDoctorSchedules(req.user.id, (0, params_js_1.parseIdParam)(req.params.doctorId, 'doctorId'));
        (0, apiResponse_js_1.sendSuccess)(res, schedules);
    });
    generateDoctorRecurringAvailability = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await clinics_service_js_1.clinicsService.generateDoctorRecurringAvailability(req.user.id, (0, params_js_1.parseIdParam)(req.params.doctorId, 'doctorId'), req.body);
        (0, apiResponse_js_1.sendSuccess)(res, result, 'Slots generated');
    });
    generateDoctorAvailability = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await clinics_service_js_1.clinicsService.generateDoctorAvailability(req.user.id, (0, params_js_1.parseIdParam)(req.params.doctorId, 'doctorId'), req.body);
        (0, apiResponse_js_1.sendSuccess)(res, result, 'Slots generated');
    });
    createDoctorAvailabilitySlot = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const slot = await clinics_service_js_1.clinicsService.createDoctorAvailabilitySlot(req.user.id, (0, params_js_1.parseIdParam)(req.params.doctorId, 'doctorId'), req.body.date, req.body.time);
        (0, apiResponse_js_1.sendSuccess)(res, slot, 'Slot created', 201);
    });
    deleteDoctorAvailabilitySlot = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        await clinics_service_js_1.clinicsService.deleteDoctorAvailabilitySlot(req.user.id, (0, params_js_1.parseIdParam)(req.params.doctorId, 'doctorId'), (0, params_js_1.parseIdParam)(req.params.slotId, 'slotId'));
        (0, apiResponse_js_1.sendSuccess)(res, null, 'Slot deleted');
    });
    manualBookForDoctor = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const appointment = await clinics_service_js_1.clinicsService.manualBookForDoctor(req.user.id, (0, params_js_1.parseIdParam)(req.params.doctorId, 'doctorId'), req.body);
        (0, apiResponse_js_1.sendSuccess)(res, appointment, 'Manual booking created', 201);
    });
    acceptDoctorAppointment = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const appointment = await clinics_service_js_1.clinicsService.acceptDoctorAppointment(req.user.id, (0, params_js_1.parseIdParam)(req.params.doctorId, 'doctorId'), (0, params_js_1.parseIdParam)(req.params.appointmentId, 'appointmentId'));
        (0, apiResponse_js_1.sendSuccess)(res, appointment, 'Appointment accepted');
    });
    rejectDoctorAppointment = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const appointment = await clinics_service_js_1.clinicsService.rejectDoctorAppointment(req.user.id, (0, params_js_1.parseIdParam)(req.params.doctorId, 'doctorId'), (0, params_js_1.parseIdParam)(req.params.appointmentId, 'appointmentId'));
        (0, apiResponse_js_1.sendSuccess)(res, appointment, 'Appointment rejected');
    });
    markDoctorAppointmentAttendance = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const appointment = await clinics_service_js_1.clinicsService.markDoctorAppointmentAttendance(req.user.id, (0, params_js_1.parseIdParam)(req.params.doctorId, 'doctorId'), (0, params_js_1.parseIdParam)(req.params.appointmentId, 'appointmentId'), req.body.attendanceStatus);
        (0, apiResponse_js_1.sendSuccess)(res, appointment, 'Attendance updated');
    });
    getDoctorChatMessages = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await clinics_service_js_1.clinicsService.getDoctorChatMessages(req.user.id, (0, params_js_1.parseIdParam)(req.params.doctorId, 'doctorId'), req.query.patientId, req.query);
        (0, apiResponse_js_1.sendSuccess)(res, result);
    });
    sendDoctorChatMessage = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const message = await clinics_service_js_1.clinicsService.sendDoctorChatMessage(req.user.id, (0, params_js_1.parseIdParam)(req.params.doctorId, 'doctorId'), req.body.patientId, req.body.message);
        (0, apiResponse_js_1.sendSuccess)(res, message, 'Message sent', 201);
    });
    markDoctorChatAsRead = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await clinics_service_js_1.clinicsService.markDoctorChatAsRead(req.user.id, (0, params_js_1.parseIdParam)(req.params.doctorId, 'doctorId'), req.body.patientId);
        (0, apiResponse_js_1.sendSuccess)(res, result, 'Messages marked as read');
    });
    getDoctorChatConversationReplies = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const settings = await clinics_service_js_1.clinicsService.getDoctorChatConversationReplies(req.user.id, (0, params_js_1.parseIdParam)(req.params.doctorId, 'doctorId'), req.query.patientId);
        (0, apiResponse_js_1.sendSuccess)(res, settings);
    });
    updateDoctorChatConversationReplies = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const settings = await clinics_service_js_1.clinicsService.updateDoctorChatConversationReplies(req.user.id, (0, params_js_1.parseIdParam)(req.params.doctorId, 'doctorId'), req.body.patientId, req.body.repliesEnabled);
        (0, apiResponse_js_1.sendSuccess)(res, settings, 'Conversation replies updated');
    });
    setDoctorOnlineStatus = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const doctor = await clinics_service_js_1.clinicsService.setDoctorOnlineStatus(req.user.id, (0, params_js_1.parseIdParam)(req.params.doctorId, 'doctorId'), req.body.isOnline);
        (0, apiResponse_js_1.sendSuccess)(res, doctor, 'Doctor online status updated');
    });
    adminList = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await clinics_service_js_1.clinicsService.listAll(req.query);
        (0, apiResponse_js_1.sendSuccess)(res, result);
    });
    adminListPending = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await clinics_service_js_1.clinicsService.listPending(req.query);
        (0, apiResponse_js_1.sendSuccess)(res, result);
    });
    adminGet = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const clinic = await clinics_service_js_1.clinicsService.getProfile((0, params_js_1.parseIdParam)(req.params.id, 'id'));
        (0, apiResponse_js_1.sendSuccess)(res, clinic);
    });
    adminUpdate = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const admin = await auth_service_js_1.authService.getProfile(req.user.id, req.user.userType);
        const clinic = await clinics_service_js_1.clinicsService.adminUpdate((0, params_js_1.parseIdParam)(req.params.id, 'id'), req.body, admin.name);
        (0, apiResponse_js_1.sendSuccess)(res, clinic, 'Clinic updated');
    });
}
exports.ClinicsController = ClinicsController;
exports.clinicsController = new ClinicsController();
//# sourceMappingURL=clinics.controller.js.map