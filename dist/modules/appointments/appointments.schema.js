"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAppointmentsQuerySchema = exports.appointmentIdParamSchema = exports.updateAttendanceSchema = exports.updateAppointmentStatusSchema = exports.rescheduleAppointmentSchema = exports.doctorManualBookSchema = exports.bookAppointmentSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const slotGenerator_js_1 = require("../../utils/slotGenerator.js");
exports.bookAppointmentSchema = zod_1.z.object({
    doctorId: zod_1.z.string().uuid(),
    date: zod_1.z.preprocess(slotGenerator_js_1.parseLocalDateInput, zod_1.z.date()),
    time: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
    notes: zod_1.z.string().max(1000).optional(),
    patientName: zod_1.z.string().max(100).optional(),
    patientPhone: zod_1.z.string().max(20).optional(),
});
exports.doctorManualBookSchema = zod_1.z.object({
    patientName: zod_1.z.string().min(2).max(100),
    patientPhone: zod_1.z.string().max(20).optional(),
    date: zod_1.z.preprocess(slotGenerator_js_1.parseLocalDateInput, zod_1.z.date()),
    time: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
    notes: zod_1.z.string().max(1000).optional(),
});
exports.rescheduleAppointmentSchema = zod_1.z.object({
    date: zod_1.z.preprocess(slotGenerator_js_1.parseLocalDateInput, zod_1.z.date()),
    time: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
});
exports.updateAppointmentStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.AppointmentStatus),
});
exports.updateAttendanceSchema = zod_1.z.object({
    attendanceStatus: zod_1.z.nativeEnum(client_1.AttendanceStatus),
});
exports.appointmentIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.listAppointmentsQuerySchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.AppointmentStatus).optional(),
    page: zod_1.z.coerce.number().optional(),
    limit: zod_1.z.coerce.number().optional(),
    from: zod_1.z.preprocess(slotGenerator_js_1.parseLocalDateInput, zod_1.z.date().optional()),
    to: zod_1.z.preprocess(slotGenerator_js_1.parseLocalDateInput, zod_1.z.date().optional()),
});
//# sourceMappingURL=appointments.schema.js.map