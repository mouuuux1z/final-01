import type { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { parseIdParam } from '../../utils/params.js';
import { notificationsService } from './notifications.service.js';

export class NotificationsController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationsService.list(
      req.user!.id,
      req.user!.userType,
      req.query as Record<string, unknown>,
    );
    sendSuccess(res, result);
  });

  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationsService.markAsRead(
      parseIdParam(req.params.id, 'id'),
      req.user!.id,
      req.user!.userType,
    );
    sendSuccess(res, result, 'Notification marked as read');
  });

  markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationsService.markAllAsRead(req.user!.id, req.user!.userType);
    sendSuccess(res, result, 'All notifications marked as read');
  });
}

export const notificationsController = new NotificationsController();
