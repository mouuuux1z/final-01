import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { notificationsController } from './notifications.controller.js';
import { listNotificationsQuerySchema, notificationIdParamSchema } from './notifications.schema.js';

const router = Router();
router.use(authMiddleware);

router.get('/', validate(listNotificationsQuerySchema, 'query'), notificationsController.list);
router.patch('/read-all', notificationsController.markAllAsRead);
router.patch('/:id/read', validate(notificationIdParamSchema, 'params'), notificationsController.markAsRead);

export default router;
