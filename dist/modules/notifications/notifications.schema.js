"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllReadSchema = exports.notificationIdParamSchema = exports.listNotificationsQuerySchema = void 0;
const zod_1 = require("zod");
exports.listNotificationsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().optional(),
    limit: zod_1.z.coerce.number().optional(),
    unreadOnly: zod_1.z
        .union([zod_1.z.literal('true'), zod_1.z.literal('false'), zod_1.z.boolean()])
        .optional()
        .transform((val) => val === true || val === 'true'),
});
exports.notificationIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.markAllReadSchema = zod_1.z.object({}).optional();
//# sourceMappingURL=notifications.schema.js.map