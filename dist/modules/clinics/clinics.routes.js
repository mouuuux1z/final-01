"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminClinicRoutes = exports.clinicRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const adminAuth_middleware_js_1 = require("../../middleware/adminAuth.middleware.js");
const requireActiveClinic_middleware_js_1 = require("../../middleware/requireActiveClinic.middleware.js");
const validate_middleware_js_1 = require("../../middleware/validate.middleware.js");
const upload_middleware_js_1 = require("../../middleware/upload.middleware.js");
const clinics_controller_js_1 = require("./clinics.controller.js");
const clinics_schema_js_1 = require("./clinics.schema.js");
const zod_1 = require("zod");
const doctors_schema_js_1 = require("../doctors/doctors.schema.js");
const appointments_schema_js_1 = require("../appointments/appointments.schema.js");
const doctorIdParamSchema = zod_1.z.object({ doctorId: zod_1.z.string().uuid() });
const doctorAppointmentParamSchema = zod_1.z.object({
    doctorId: zod_1.z.string().uuid(),
    appointmentId: zod_1.z.string().uuid(),
});
const doctorSlotParamSchema = zod_1.z.object({
    doctorId: zod_1.z.string().uuid(),
    slotId: zod_1.z.string().uuid(),
});
const clinicChatPatientQuerySchema = zod_1.z.object({
    patientId: zod_1.z.string().uuid(),
    page: zod_1.z.coerce.number().optional(),
    limit: zod_1.z.coerce.number().optional(),
});
const clinicChatPatientBodySchema = zod_1.z.object({
    patientId: zod_1.z.string().uuid(),
});
const clinicChatSendMessageSchema = zod_1.z.object({
    patientId: zod_1.z.string().uuid(),
    message: zod_1.z.string().min(1).max(5000),
});
const clinicChatRepliesSchema = zod_1.z.object({
    patientId: zod_1.z.string().uuid(),
    repliesEnabled: zod_1.z.boolean(),
});
const router = (0, express_1.Router)();
exports.clinicRoutes = router;
router.use(auth_middleware_js_1.authMiddleware, (0, auth_middleware_js_1.requireUserTypes)(client_1.UserType.CLINIC));
router.get('/me', clinics_controller_js_1.clinicsController.getMe);
router.patch('/me', (0, validate_middleware_js_1.validate)(clinics_schema_js_1.updateClinicSchema), clinics_controller_js_1.clinicsController.updateMe);
router.get('/me/doctors/:doctorId/appointments', requireActiveClinic_middleware_js_1.requireActiveClinic, (0, validate_middleware_js_1.validate)(doctorIdParamSchema, 'params'), (0, validate_middleware_js_1.validate)(appointments_schema_js_1.listAppointmentsQuerySchema, 'query'), clinics_controller_js_1.clinicsController.getDoctorAppointments);
router.get('/me/doctors/:doctorId/availability', requireActiveClinic_middleware_js_1.requireActiveClinic, (0, validate_middleware_js_1.validate)(doctorIdParamSchema, 'params'), (0, validate_middleware_js_1.validate)(doctors_schema_js_1.availabilityQuerySchema, 'query'), clinics_controller_js_1.clinicsController.getDoctorAvailability);
router.get('/me/doctors/:doctorId/schedules', requireActiveClinic_middleware_js_1.requireActiveClinic, (0, validate_middleware_js_1.validate)(doctorIdParamSchema, 'params'), clinics_controller_js_1.clinicsController.getDoctorSchedules);
router.post('/me/doctors/:doctorId/availability/generate-recurring', requireActiveClinic_middleware_js_1.requireActiveClinic, (0, validate_middleware_js_1.validate)(doctorIdParamSchema, 'params'), (0, validate_middleware_js_1.validate)(doctors_schema_js_1.generateRecurringAvailabilitySchema), clinics_controller_js_1.clinicsController.generateDoctorRecurringAvailability);
router.post('/me/doctors/:doctorId/availability/generate', requireActiveClinic_middleware_js_1.requireActiveClinic, (0, validate_middleware_js_1.validate)(doctorIdParamSchema, 'params'), (0, validate_middleware_js_1.validate)(doctors_schema_js_1.generateAvailabilitySchema), clinics_controller_js_1.clinicsController.generateDoctorAvailability);
router.post('/me/doctors/:doctorId/availability', requireActiveClinic_middleware_js_1.requireActiveClinic, (0, validate_middleware_js_1.validate)(doctorIdParamSchema, 'params'), (0, validate_middleware_js_1.validate)(doctors_schema_js_1.createAvailabilitySlotSchema), clinics_controller_js_1.clinicsController.createDoctorAvailabilitySlot);
router.delete('/me/doctors/:doctorId/availability/:slotId', requireActiveClinic_middleware_js_1.requireActiveClinic, (0, validate_middleware_js_1.validate)(doctorSlotParamSchema, 'params'), clinics_controller_js_1.clinicsController.deleteDoctorAvailabilitySlot);
router.post('/me/doctors/:doctorId/appointments/manual', requireActiveClinic_middleware_js_1.requireActiveClinic, (0, validate_middleware_js_1.validate)(doctorIdParamSchema, 'params'), (0, validate_middleware_js_1.validate)(appointments_schema_js_1.doctorManualBookSchema), clinics_controller_js_1.clinicsController.manualBookForDoctor);
router.post('/me/doctors/:doctorId/appointments/:appointmentId/accept', requireActiveClinic_middleware_js_1.requireActiveClinic, (0, validate_middleware_js_1.validate)(doctorAppointmentParamSchema, 'params'), clinics_controller_js_1.clinicsController.acceptDoctorAppointment);
router.post('/me/doctors/:doctorId/appointments/:appointmentId/reject', requireActiveClinic_middleware_js_1.requireActiveClinic, (0, validate_middleware_js_1.validate)(doctorAppointmentParamSchema, 'params'), clinics_controller_js_1.clinicsController.rejectDoctorAppointment);
router.patch('/me/doctors/:doctorId/appointments/:appointmentId/attendance', requireActiveClinic_middleware_js_1.requireActiveClinic, (0, validate_middleware_js_1.validate)(doctorAppointmentParamSchema, 'params'), (0, validate_middleware_js_1.validate)(appointments_schema_js_1.updateAttendanceSchema), clinics_controller_js_1.clinicsController.markDoctorAppointmentAttendance);
router.get('/me/doctors/:doctorId/chat/messages', requireActiveClinic_middleware_js_1.requireActiveClinic, (0, validate_middleware_js_1.validate)(doctorIdParamSchema, 'params'), (0, validate_middleware_js_1.validate)(clinicChatPatientQuerySchema, 'query'), clinics_controller_js_1.clinicsController.getDoctorChatMessages);
router.post('/me/doctors/:doctorId/chat/messages', requireActiveClinic_middleware_js_1.requireActiveClinic, (0, validate_middleware_js_1.validate)(doctorIdParamSchema, 'params'), (0, validate_middleware_js_1.validate)(clinicChatSendMessageSchema), clinics_controller_js_1.clinicsController.sendDoctorChatMessage);
router.post('/me/doctors/:doctorId/chat/messages/read', requireActiveClinic_middleware_js_1.requireActiveClinic, (0, validate_middleware_js_1.validate)(doctorIdParamSchema, 'params'), (0, validate_middleware_js_1.validate)(clinicChatPatientBodySchema), clinics_controller_js_1.clinicsController.markDoctorChatAsRead);
router.get('/me/doctors/:doctorId/chat/conversations/replies', requireActiveClinic_middleware_js_1.requireActiveClinic, (0, validate_middleware_js_1.validate)(doctorIdParamSchema, 'params'), (0, validate_middleware_js_1.validate)(clinicChatPatientQuerySchema.pick({ patientId: true }), 'query'), clinics_controller_js_1.clinicsController.getDoctorChatConversationReplies);
router.patch('/me/doctors/:doctorId/chat/conversations/replies', requireActiveClinic_middleware_js_1.requireActiveClinic, (0, validate_middleware_js_1.validate)(doctorIdParamSchema, 'params'), (0, validate_middleware_js_1.validate)(clinicChatRepliesSchema), clinics_controller_js_1.clinicsController.updateDoctorChatConversationReplies);
router.post('/me/doctors', requireActiveClinic_middleware_js_1.requireActiveClinic, upload_middleware_js_1.uploadCertificate.single('certificate'), (0, validate_middleware_js_1.validate)(clinics_schema_js_1.createClinicDoctorSchema), clinics_controller_js_1.clinicsController.createDoctor);
router.post('/me/doctors/assign', requireActiveClinic_middleware_js_1.requireActiveClinic, (0, validate_middleware_js_1.validate)(clinics_schema_js_1.assignDoctorSchema), clinics_controller_js_1.clinicsController.assignDoctor);
router.patch('/me/doctors/:doctorId/status', requireActiveClinic_middleware_js_1.requireActiveClinic, (0, validate_middleware_js_1.validate)(doctorIdParamSchema, 'params'), (0, validate_middleware_js_1.validate)(clinics_schema_js_1.clinicDoctorStatusSchema), clinics_controller_js_1.clinicsController.updateDoctorStatus);
router.patch('/me/doctors/:doctorId/online', requireActiveClinic_middleware_js_1.requireActiveClinic, (0, validate_middleware_js_1.validate)(doctorIdParamSchema, 'params'), (0, validate_middleware_js_1.validate)(doctors_schema_js_1.onlineStatusSchema), clinics_controller_js_1.clinicsController.setDoctorOnlineStatus);
router.delete('/me/doctors/:doctorId', requireActiveClinic_middleware_js_1.requireActiveClinic, (0, validate_middleware_js_1.validate)(doctorIdParamSchema, 'params'), clinics_controller_js_1.clinicsController.removeDoctor);
const adminRouter = (0, express_1.Router)();
exports.adminClinicRoutes = adminRouter;
adminRouter.use(...adminAuth_middleware_js_1.adminAuthMiddleware);
adminRouter.get('/', (0, validate_middleware_js_1.validate)(clinics_schema_js_1.clinicListQuerySchema, 'query'), clinics_controller_js_1.clinicsController.adminList);
adminRouter.get('/pending', (0, validate_middleware_js_1.validate)(clinics_schema_js_1.clinicListQuerySchema, 'query'), clinics_controller_js_1.clinicsController.adminListPending);
adminRouter.get('/:id', (0, validate_middleware_js_1.validate)(clinics_schema_js_1.clinicIdParamSchema, 'params'), clinics_controller_js_1.clinicsController.adminGet);
adminRouter.patch('/:id', (0, validate_middleware_js_1.validate)(clinics_schema_js_1.clinicIdParamSchema, 'params'), (0, validate_middleware_js_1.validate)(clinics_schema_js_1.adminUpdateClinicSchema), clinics_controller_js_1.clinicsController.adminUpdate);
//# sourceMappingURL=clinics.routes.js.map