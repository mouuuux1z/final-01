"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsService = exports.NotificationsService = void 0;
const client_1 = require("@prisma/client");
const AppError_js_1 = require("../../utils/AppError.js");
const pagination_js_1 = require("../../utils/pagination.js");
const notifications_repository_js_1 = require("./notifications.repository.js");
function mapUserTypeToTarget(userType) {
    switch (userType) {
        case client_1.UserType.ADMIN:
            return client_1.NotificationTargetType.ADMIN;
        case client_1.UserType.CLINIC:
            return client_1.NotificationTargetType.CLINIC;
        case client_1.UserType.DOCTOR:
            return client_1.NotificationTargetType.DOCTOR;
        case client_1.UserType.PATIENT:
            return client_1.NotificationTargetType.PATIENT;
        default:
            throw new AppError_js_1.AppError('Invalid user type', 400);
    }
}
class NotificationsService {
    async list(userId, userType, query) {
        const pagination = (0, pagination_js_1.parsePagination)(query);
        const targetType = mapUserTypeToTarget(userType);
        const { items, total } = await notifications_repository_js_1.notificationsRepository.findForUser(targetType, userId, pagination, query.unreadOnly);
        const unreadCount = await notifications_repository_js_1.notificationsRepository.countUnread(targetType, userId);
        return {
            items,
            unreadCount,
            meta: (0, pagination_js_1.buildPaginationMeta)(pagination.page, pagination.limit, total),
        };
    }
    async markAsRead(id, userId, userType) {
        const targetType = mapUserTypeToTarget(userType);
        const result = await notifications_repository_js_1.notificationsRepository.markAsRead(id, targetType, userId);
        if (result.count === 0)
            throw new AppError_js_1.AppError('Notification not found', 404);
        return result;
    }
    async markAllAsRead(userId, userType) {
        const targetType = mapUserTypeToTarget(userType);
        return notifications_repository_js_1.notificationsRepository.markAllAsRead(targetType, userId);
    }
}
exports.NotificationsService = NotificationsService;
exports.notificationsService = new NotificationsService();
//# sourceMappingURL=notifications.service.js.map