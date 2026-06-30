"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatAccessQuerySchema = exports.listConversationsQuerySchema = exports.markReadSchema = exports.conversationSettingsQuerySchema = exports.conversationRepliesSchema = exports.conversationQuerySchema = exports.sendMessageSchema = void 0;
const zod_1 = require("zod");
exports.sendMessageSchema = zod_1.z.object({
    doctorId: zod_1.z.string().uuid(),
    patientId: zod_1.z.string().uuid(),
    message: zod_1.z.string().min(1).max(5000),
});
exports.conversationQuerySchema = zod_1.z.object({
    doctorId: zod_1.z.string().uuid(),
    patientId: zod_1.z.string().uuid(),
    page: zod_1.z.coerce.number().optional(),
    limit: zod_1.z.coerce.number().optional(),
});
exports.conversationRepliesSchema = zod_1.z.object({
    doctorId: zod_1.z.string().uuid(),
    patientId: zod_1.z.string().uuid(),
    repliesEnabled: zod_1.z.boolean(),
});
exports.conversationSettingsQuerySchema = zod_1.z.object({
    doctorId: zod_1.z.string().uuid(),
    patientId: zod_1.z.string().uuid(),
});
exports.markReadSchema = zod_1.z.object({
    doctorId: zod_1.z.string().uuid(),
    patientId: zod_1.z.string().uuid(),
});
exports.listConversationsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().optional(),
    limit: zod_1.z.coerce.number().optional(),
});
exports.chatAccessQuerySchema = zod_1.z.object({
    doctorId: zod_1.z.string().uuid(),
    patientId: zod_1.z.string().uuid(),
});
//# sourceMappingURL=chat.schema.js.map