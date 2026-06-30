"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clinicListQuerySchema = exports.clinicIdParamSchema = exports.clinicDoctorStatusSchema = exports.createClinicDoctorSchema = exports.assignDoctorSchema = exports.adminUpdateClinicSchema = exports.updateClinicSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.updateClinicSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    location: zod_1.z.string().min(2).max(200).optional(),
    phone: zod_1.z.string().min(8).max(20).optional(),
    city: zod_1.z.string().min(2).max(100).optional(),
    specialization: zod_1.z.string().min(2).max(100).optional(),
});
exports.adminUpdateClinicSchema = exports.updateClinicSchema.extend({
    status: zod_1.z.nativeEnum(client_1.EntityStatus).optional(),
});
exports.assignDoctorSchema = zod_1.z.object({
    doctorId: zod_1.z.string().uuid(),
});
exports.createClinicDoctorSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(128),
    phone: zod_1.z.string().min(8).max(20),
    specialization: zod_1.z.string().min(2).max(100),
    city: zod_1.z.string().min(2).max(100),
    location: zod_1.z.string().min(2).max(200),
    clinicInfo: zod_1.z.string().max(1000).optional(),
    description: zod_1.z.string().max(2000).optional(),
});
exports.clinicDoctorStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([client_1.EntityStatus.ACTIVE, client_1.EntityStatus.DISABLED]),
    disableReason: zod_1.z.string().max(500).optional().nullable(),
});
exports.clinicIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.clinicListQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().optional(),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional(),
    status: zod_1.z.nativeEnum(client_1.EntityStatus).optional(),
});
//# sourceMappingURL=clinics.schema.js.map