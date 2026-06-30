"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsRepository = exports.NotificationsRepository = void 0;
const client_1 = require("@prisma/client");
const database_js_1 = require("../../config/database.js");
class NotificationsRepository {
    async findForUser(targetType, targetId, pagination, unreadOnly) {
        const where = {
            OR: [
                { targetType, targetId },
                { targetType: client_1.NotificationTargetType.ALL },
            ],
        };
        if (unreadOnly)
            where.read = false;
        const [items, total] = await Promise.all([
            database_js_1.prisma.notification.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { createdAt: 'desc' },
            }),
            database_js_1.prisma.notification.count({ where }),
        ]);
        return { items, total };
    }
    async markAsRead(id, targetType, targetId) {
        return database_js_1.prisma.notification.updateMany({
            where: {
                id,
                OR: [
                    { targetType, targetId },
                    { targetType: client_1.NotificationTargetType.ALL },
                ],
            },
            data: { read: true },
        });
    }
    async markAllAsRead(targetType, targetId) {
        return database_js_1.prisma.notification.updateMany({
            where: {
                read: false,
                OR: [
                    { targetType, targetId },
                    { targetType: client_1.NotificationTargetType.ALL },
                ],
            },
            data: { read: true },
        });
    }
    async countUnread(targetType, targetId) {
        return database_js_1.prisma.notification.count({
            where: {
                read: false,
                OR: [
                    { targetType, targetId },
                    { targetType: client_1.NotificationTargetType.ALL },
                ],
            },
        });
    }
}
exports.NotificationsRepository = NotificationsRepository;
exports.notificationsRepository = new NotificationsRepository();
//# sourceMappingURL=notifications.repository.js.map