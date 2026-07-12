import { NotificationTargetType, UserType } from '@prisma/client';
import { AppError } from '../../utils/AppError.js';
import { buildPaginationMeta, parsePagination } from '../../utils/pagination.js';
import { notificationsRepository } from './notifications.repository.js';

function mapUserTypeToTarget(userType: UserType): NotificationTargetType {
  switch (userType) {
    case UserType.ADMIN:
      return NotificationTargetType.ADMIN;
    case UserType.CLINIC:
      return NotificationTargetType.CLINIC;
    case UserType.DOCTOR:
      return NotificationTargetType.DOCTOR;
    case UserType.PATIENT:
      return NotificationTargetType.PATIENT;
    default:
      throw new AppError('Invalid user type', 400);
  }
}

export class NotificationsService {
  async list(userId: string, userType: UserType, query: Record<string, unknown>) {
    const pagination = parsePagination(query);
    const targetType = mapUserTypeToTarget(userType);
    const { items, total } = await notificationsRepository.findForUser(
      targetType,
      userId,
      pagination,
      query.unreadOnly as boolean | undefined,
    );
    const unreadCount = await notificationsRepository.countUnread(targetType, userId);
    return {
      items,
      unreadCount,
      meta: buildPaginationMeta(pagination.page, pagination.limit, total),
    };
  }

  async markAsRead(id: string, userId: string, userType: UserType) {
    const targetType = mapUserTypeToTarget(userType);
    const result = await notificationsRepository.markAsRead(id, targetType, userId);
    if (result.count === 0) throw new AppError('Notification not found', 404);
    return result;
  }

  async markAllAsRead(userId: string, userType: UserType) {
    const targetType = mapUserTypeToTarget(userType);
    return notificationsRepository.markAllAsRead(targetType, userId);
  }
}

export const notificationsService = new NotificationsService();
