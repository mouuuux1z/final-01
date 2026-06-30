import { NotificationTargetType, Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import type { PaginationParams } from '../../utils/pagination.js';

export class NotificationsRepository {
  async findForUser(
    targetType: NotificationTargetType,
    targetId: string,
    pagination: PaginationParams,
    unreadOnly?: boolean,
  ) {
    const where: Prisma.NotificationWhereInput = {
      OR: [
        { targetType, targetId },
        { targetType: NotificationTargetType.ALL },
      ],
    };
    if (unreadOnly) where.read = false;

    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    return { items, total };
  }

  async markAsRead(id: string, targetType: NotificationTargetType, targetId: string) {
    return prisma.notification.updateMany({
      where: {
        id,
        OR: [
          { targetType, targetId },
          { targetType: NotificationTargetType.ALL },
        ],
      },
      data: { read: true },
    });
  }

  async markAllAsRead(targetType: NotificationTargetType, targetId: string) {
    return prisma.notification.updateMany({
      where: {
        read: false,
        OR: [
          { targetType, targetId },
          { targetType: NotificationTargetType.ALL },
        ],
      },
      data: { read: true },
    });
  }

  async countUnread(targetType: NotificationTargetType, targetId: string) {
    return prisma.notification.count({
      where: {
        read: false,
        OR: [
          { targetType, targetId },
          { targetType: NotificationTargetType.ALL },
        ],
      },
    });
  }
}

export const notificationsRepository = new NotificationsRepository();
