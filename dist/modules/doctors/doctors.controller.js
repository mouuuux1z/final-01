"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorsController = exports.DoctorsController = void 0;
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const asyncHandler_js_1 = require("../../utils/asyncHandler.js");
const params_js_1 = require("../../utils/params.js");
const upload_middleware_js_1 = require("../../middleware/upload.middleware.js");
const doctors_service_js_1 = require("./doctors.service.js");
class DoctorsController {
    search = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await doctors_service_js_1.doctorsService.search(req.query);
        (0, apiResponse_js_1.sendSuccess)(res, result);
    });
    getProfile = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const doctor = await doctors_service_js_1.doctorsService.getProfile((0, params_js_1.parseIdParam)(req.params.id, 'id'));
        (0, apiResponse_js_1.sendSuccess)(res, doctor);
    });
    getMe = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const doctor = await doctors_service_js_1.doctorsService.getById(req.user.id);
        (0, apiResponse_js_1.sendSuccess)(res, doctor);
    });
    updateMe = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const files = req.files;
        const image = files?.image?.[0]?.filename ? (0, upload_middleware_js_1.getFileUrl)(files.image[0].filename) : undefined;
        const certificate = files?.certificate?.[0]?.filename ? (0, upload_middleware_js_1.getFileUrl)(files.certificate[0].filename) : undefined;
        const doctor = await doctors_service_js_1.doctorsService.updateProfile(req.user.id, req.body, image, certificate);
        (0, apiResponse_js_1.sendSuccess)(res, doctor, 'Profile updated');
    });
    setOnlineStatus = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await doctors_service_js_1.doctorsService.setOnlineStatus(req.user.id, req.body.isOnline);
        (0, apiResponse_js_1.sendSuccess)(res, result, 'Online status updated');
    });
    getSchedules = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const doctorId = (0, params_js_1.parseIdParam)(req.params.id ?? req.user.id, 'id');
        doctors_service_js_1.doctorsService.assertDoctorAccess(req.user.id, req.user.userType, doctorId);
        const schedules = await doctors_service_js_1.doctorsService.getSchedules(doctorId);
        (0, apiResponse_js_1.sendSuccess)(res, schedules);
    });
    createSchedule = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const schedule = await doctors_service_js_1.doctorsService.createSchedule(req.user.id, req.body);
        (0, apiResponse_js_1.sendSuccess)(res, schedule, 'Schedule created', 201);
    });
    updateSchedule = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const schedule = await doctors_service_js_1.doctorsService.updateSchedule((0, params_js_1.parseIdParam)(req.params.scheduleId, 'scheduleId'), req.user.id, req.body);
        (0, apiResponse_js_1.sendSuccess)(res, schedule, 'Schedule updated');
    });
    deleteSchedule = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        await doctors_service_js_1.doctorsService.deleteSchedule((0, params_js_1.parseIdParam)(req.params.scheduleId, 'scheduleId'), req.user.id);
        (0, apiResponse_js_1.sendSuccess)(res, null, 'Schedule deleted');
    });
    getAvailability = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const doctorId = (0, params_js_1.parseIdParam)(req.params.id, 'id');
        const query = req.query;
        const slots = await doctors_service_js_1.doctorsService.getMyAvailability(doctorId, {
            date: query.date,
            from: query.from,
            to: query.to,
            availableOnly: query.availableOnly === true || query.availableOnly === 'true',
        });
        (0, apiResponse_js_1.sendSuccess)(res, slots);
    });
    createAvailabilitySlot = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const slot = await doctors_service_js_1.doctorsService.createAvailabilitySlot(req.user.id, req.body.date, req.body.time);
        (0, apiResponse_js_1.sendSuccess)(res, slot, 'Slot created', 201);
    });
    bulkCreateAvailability = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await doctors_service_js_1.doctorsService.bulkCreateAvailability(req.user.id, req.body.date, req.body.times);
        (0, apiResponse_js_1.sendSuccess)(res, result, 'Slots created', 201);
    });
    generateAvailability = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await doctors_service_js_1.doctorsService.generateAvailability(req.user.id, req.body);
        (0, apiResponse_js_1.sendSuccess)(res, result, 'Availability slots generated', 201);
    });
    generateRecurringAvailability = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await doctors_service_js_1.doctorsService.generateRecurringAvailability(req.user.id, req.body);
        (0, apiResponse_js_1.sendSuccess)(res, result, 'Recurring availability slots generated', 201);
    });
    getMyAvailability = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const query = req.query;
        const slots = await doctors_service_js_1.doctorsService.getMyAvailability(req.user.id, {
            date: query.date,
            from: query.from,
            to: query.to,
            availableOnly: query.availableOnly === true || query.availableOnly === 'true',
        });
        (0, apiResponse_js_1.sendSuccess)(res, slots);
    });
    deleteAvailabilitySlot = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        await doctors_service_js_1.doctorsService.deleteAvailabilitySlot((0, params_js_1.parseIdParam)(req.params.slotId, 'slotId'), req.user.id);
        (0, apiResponse_js_1.sendSuccess)(res, null, 'Slot deleted');
    });
    adminList = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await doctors_service_js_1.doctorsService.adminSearch(req.query);
        (0, apiResponse_js_1.sendSuccess)(res, result);
    });
    adminUpdate = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const doctor = await doctors_service_js_1.doctorsService.adminUpdate((0, params_js_1.parseIdParam)(req.params.id, 'id'), req.body);
        (0, apiResponse_js_1.sendSuccess)(res, doctor, 'Doctor updated');
    });
    adminDelete = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        await doctors_service_js_1.doctorsService.deleteDoctor((0, params_js_1.parseIdParam)(req.params.id, 'id'));
        (0, apiResponse_js_1.sendSuccess)(res, null, 'Doctor deleted');
    });
}
exports.DoctorsController = DoctorsController;
exports.doctorsController = new DoctorsController();
//# sourceMappingURL=doctors.controller.js.map