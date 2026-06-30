"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userListQuerySchema = exports.complaintIdParamSchema = exports.analyticsQuerySchema = exports.siteContentSchema = exports.updateComplaintSchema = exports.verifyDoctorSchema = exports.createAdminSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createAdminSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(128),
    role: zod_1.z.nativeEnum(client_1.AdminRole).optional(),
});
exports.verifyDoctorSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.EntityStatus),
    disableReason: zod_1.z.string().max(1000).nullable().optional(),
});
exports.updateComplaintSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.ComplaintStatus),
});
exports.siteContentSchema = zod_1.z.object({
    key: zod_1.z.string().min(1).max(100),
    value: zod_1.z.string().min(1),
});
exports.analyticsQuerySchema = zod_1.z.object({
    from: zod_1.z.coerce.date().optional(),
    to: zod_1.z.coerce.date().optional(),
});
exports.complaintIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.userListQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().optional(),
    limit: zod_1.z.coerce.number().optional(),
    status: zod_1.z.nativeEnum(client_1.EntityStatus).optional(),
});
//# sourceMappingURL=admin.schema.js.map