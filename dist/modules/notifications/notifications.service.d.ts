import { UserType } from '@prisma/client';
export declare class NotificationsService {
    list(userId: string, userType: UserType, query: Record<string, unknown>): Promise<{
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
        unreadCount: number;
        meta: import("../../utils/pagination.js").PaginationMeta;
    }>;
    markAsRead(id: string, userId: string, userType: UserType): Promise<import("@prisma/client").Prisma.BatchPayload>;
    markAllAsRead(userId: string, userType: UserType): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
export declare const notificationsService: NotificationsService;
