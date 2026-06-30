import { NotificationTargetType, Prisma } from '@prisma/client';
import type { PaginationParams } from '../../utils/pagination.js';
export declare class NotificationsRepository {
    findForUser(targetType: NotificationTargetType, targetId: string, pagination: PaginationParams, unreadOnly?: boolean): Promise<{
        items: {
            message: string;
            type: import("@prisma/client").$Enums.NotificationType;
            id: string;
            createdAt: Date;
            targetType: import("@prisma/client").$Enums.NotificationTargetType;
            targetId: string | null;
            title: string;
            read: boolean;
        }[];
        total: number;
    }>;
    markAsRead(id: string, targetType: NotificationTargetType, targetId: string): Promise<Prisma.BatchPayload>;
    markAllAsRead(targetType: NotificationTargetType, targetId: string): Promise<Prisma.BatchPayload>;
    countUnread(targetType: NotificationTargetType, targetId: string): Promise<number>;
}
export declare const notificationsRepository: NotificationsRepository;
