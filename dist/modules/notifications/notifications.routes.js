"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const validate_middleware_js_1 = require("../../middleware/validate.middleware.js");
const notifications_controller_js_1 = require("./notifications.controller.js");
const notifications_schema_js_1 = require("./notifications.schema.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authMiddleware);
router.get('/', (0, validate_middleware_js_1.validate)(notifications_schema_js_1.listNotificationsQuerySchema, 'query'), notifications_controller_js_1.notificationsController.list);
router.patch('/read-all', notifications_controller_js_1.notificationsController.markAllAsRead);
router.patch('/:id/read', (0, validate_middleware_js_1.validate)(notifications_schema_js_1.notificationIdParamSchema, 'params'), notifications_controller_js_1.notificationsController.markAsRead);
exports.default = router;
//# sourceMappingURL=notifications.routes.js.map