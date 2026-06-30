"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsController = exports.NotificationsController = void 0;
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const asyncHandler_js_1 = require("../../utils/asyncHandler.js");
const params_js_1 = require("../../utils/params.js");
const notifications_service_js_1 = require("./notifications.service.js");
class NotificationsController {
    list = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await notifications_service_js_1.notificationsService.list(req.user.id, req.user.userType, req.query);
        (0, apiResponse_js_1.sendSuccess)(res, result);
    });
    markAsRead = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await notifications_service_js_1.notificationsService.markAsRead((0, params_js_1.parseIdParam)(req.params.id, 'id'), req.user.id, req.user.userType);
        (0, apiResponse_js_1.sendSuccess)(res, result, 'Notification marked as read');
    });
    markAllAsRead = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await notifications_service_js_1.notificationsService.markAllAsRead(req.user.id, req.user.userType);
        (0, apiResponse_js_1.sendSuccess)(res, result, 'All notifications marked as read');
    });
}
exports.NotificationsController = NotificationsController;
exports.notificationsController = new NotificationsController();
//# sourceMappingURL=notifications.controller.js.map