"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clinicRegisterMultipartSchema = exports.doctorRegisterMultipartSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.registerSchema = zod_1.z.discriminatedUnion('userType', [
    zod_1.z.object({
        userType: zod_1.z.literal(client_1.UserType.PATIENT),
        name: zod_1.z.string().min(2).max(100),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8).max(128),
        phone: zod_1.z.string().min(8).max(20),
    }),
    zod_1.z.object({
        userType: zod_1.z.literal(client_1.UserType.DOCTOR),
        name: zod_1.z.string().min(2).max(100),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8).max(128),
        phone: zod_1.z.string().min(8).max(20),
        specialization: zod_1.z.string().min(2).max(100),
        city: zod_1.z.string().min(2).max(100),
        location: zod_1.z.string().min(2).max(200),
        clinicInfo: zod_1.z.string().max(1000).optional(),
        description: zod_1.z.string().max(2000).optional(),
        clinicId: zod_1.z.string().uuid().optional(),
    }),
    zod_1.z.object({
        userType: zod_1.z.literal(client_1.UserType.CLINIC),
        name: zod_1.z.string().min(2).max(100),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8).max(128),
        phone: zod_1.z.string().min(8).max(20),
        location: zod_1.z.string().min(2).max(200),
        city: zod_1.z.string().min(2).max(100),
        specialization: zod_1.z.string().min(2).max(100),
    }),
]);
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email().transform((value) => value.trim().toLowerCase()),
    password: zod_1.z.string().min(1),
    userType: zod_1.z.nativeEnum(client_1.UserType).optional(),
});
exports.doctorRegisterMultipartSchema = zod_1.z.object({
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
exports.clinicRegisterMultipartSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(128),
    phone: zod_1.z.string().min(8).max(20),
    city: zod_1.z.string().min(2).max(100),
    location: zod_1.z.string().min(2).max(200),
    specialization: zod_1.z.string().min(2).max(100),
});
//# sourceMappingURL=auth.schema.js.map