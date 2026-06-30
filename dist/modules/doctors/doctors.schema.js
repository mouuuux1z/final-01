"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.availabilityQuerySchema = exports.generateRecurringAvailabilitySchema = exports.slotIdParamSchema = exports.scheduleIdParamSchema = exports.doctorIdParamSchema = exports.onlineStatusSchema = exports.generateAvailabilitySchema = exports.bulkAvailabilitySchema = exports.createAvailabilitySlotSchema = exports.updateScheduleSchema = exports.createScheduleSchema = exports.adminUpdateDoctorSchema = exports.updateDoctorSchema = exports.searchDoctorsSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const slotGenerator_js_1 = require("../../utils/slotGenerator.js");
const timeStringSchema = zod_1.z
    .string()
    .min(1)
    .transform((value) => (0, slotGenerator_js_1.normalizeTimeString)(value))
    .pipe(zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'));
const optionalTimeStringSchema = zod_1.z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? (0, slotGenerator_js_1.normalizeTimeString)(value.trim()) : undefined));
exports.searchDoctorsSchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    specialization: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().optional(),
    limit: zod_1.z.coerce.number().optional(),
});
exports.updateDoctorSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    phone: zod_1.z.string().min(8).max(20).optional(),
    specialization: zod_1.z.string().min(2).max(100).optional(),
    city: zod_1.z.string().min(2).max(100).optional(),
    location: zod_1.z.string().min(2).max(200).optional(),
    clinicInfo: zod_1.z.string().max(1000).optional(),
    description: zod_1.z.string().max(2000).optional(),
    clinicId: zod_1.z.string().uuid().nullable().optional(),
});
exports.adminUpdateDoctorSchema = exports.updateDoctorSchema.extend({
    status: zod_1.z.nativeEnum(client_1.EntityStatus).optional(),
    disableReason: zod_1.z.string().max(1000).nullable().optional(),
});
exports.createScheduleSchema = zod_1.z.object({
    dayOfWeek: zod_1.z.nativeEnum(client_1.DayOfWeek),
    startTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
    endTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
});
exports.updateScheduleSchema = exports.createScheduleSchema.partial();
exports.createAvailabilitySlotSchema = zod_1.z.object({
    date: zod_1.z.coerce.date(),
    time: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
});
exports.bulkAvailabilitySchema = zod_1.z.object({
    date: zod_1.z.coerce.date(),
    times: zod_1.z.array(zod_1.z.string().regex(/^\d{2}:\d{2}$/)).min(1),
});
exports.generateAvailabilitySchema = zod_1.z
    .object({
    date: zod_1.z.coerce.date(),
    startTime: timeStringSchema,
    endTime: timeStringSchema,
    slotDurationMinutes: zod_1.z.coerce.number().int().min(5).max(240).optional().default(30),
    gapMinutes: zod_1.z.coerce.number().int().min(0).max(120).optional().default(0),
    breakStart: optionalTimeStringSchema,
    breakEnd: optionalTimeStringSchema,
})
    .refine((data) => (0, slotGenerator_js_1.parseTimeToMinutes)(data.startTime) < (0, slotGenerator_js_1.parseTimeToMinutes)(data.endTime), {
    message: 'End time must be after start time',
});
exports.onlineStatusSchema = zod_1.z.object({
    isOnline: zod_1.z.boolean(),
});
exports.doctorIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.scheduleIdParamSchema = zod_1.z.object({
    scheduleId: zod_1.z.string().uuid(),
});
exports.slotIdParamSchema = zod_1.z.object({
    slotId: zod_1.z.string().uuid(),
});
exports.generateRecurringAvailabilitySchema = zod_1.z
    .object({
    daysOfWeek: zod_1.z.array(zod_1.z.nativeEnum(client_1.DayOfWeek)).min(1),
    startTime: timeStringSchema,
    endTime: timeStringSchema,
    slotDurationMinutes: zod_1.z.coerce.number().int().min(5).max(240).optional().default(30),
    gapMinutes: zod_1.z.coerce.number().int().min(0).max(120).optional().default(0),
    breakStart: optionalTimeStringSchema,
    breakEnd: optionalTimeStringSchema,
    weeksAhead: zod_1.z.coerce.number().int().min(1).max(12).optional().default(8),
})
    .refine((data) => (0, slotGenerator_js_1.parseTimeToMinutes)(data.startTime) < (0, slotGenerator_js_1.parseTimeToMinutes)(data.endTime), {
    message: 'End time must be after start time',
})
    .refine((data) => {
    const hasBreakStart = Boolean(data.breakStart);
    const hasBreakEnd = Boolean(data.breakEnd);
    return hasBreakStart === hasBreakEnd;
}, { message: 'Break start and end must both be provided', path: ['breakStart'] });
exports.availabilityQuerySchema = zod_1.z.object({
    date: zod_1.z.preprocess(slotGenerator_js_1.parseLocalDateInput, zod_1.z.date().optional()),
    from: zod_1.z.preprocess(slotGenerator_js_1.parseLocalDateInput, zod_1.z.date().optional()),
    to: zod_1.z.preprocess(slotGenerator_js_1.parseLocalDateInput, zod_1.z.date().optional()),
    availableOnly: zod_1.z.coerce.boolean().optional(),
});
//# sourceMappingURL=doctors.schema.js.map