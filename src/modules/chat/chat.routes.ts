import { Router } from 'express';
import { UserType } from '@prisma/client';
import { authMiddleware, requireUserTypes } from '../../middleware/auth.middleware.js';
import { uploadChatFile } from '../../middleware/upload.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { chatController } from './chat.controller.js';
import {
  chatAccessQuerySchema,
  conversationQuerySchema,
  conversationRepliesSchema,
  conversationSettingsQuerySchema,
  listConversationsQuerySchema,
  markReadSchema,
  sendMessageSchema,
} from './chat.schema.js';

const router = Router();
router.use(authMiddleware, requireUserTypes(UserType.DOCTOR, UserType.PATIENT));

router.get('/conversations', validate(listConversationsQuerySchema, 'query'), chatController.listConversations);
router.get('/access', validate(chatAccessQuerySchema, 'query'), chatController.getAccess);
router.get('/messages', validate(conversationQuerySchema, 'query'), chatController.getConversation);
router.post(
  '/messages',
  uploadChatFile.single('file'),
  validate(sendMessageSchema),
  chatController.sendMessage,
);
router.post('/messages/read', validate(markReadSchema), chatController.markAsRead);

router.get(
  '/conversations/replies',
  validate(conversationSettingsQuerySchema, 'query'),
  chatController.getConversationReplies,
);
router.patch(
  '/conversations/replies',
  requireUserTypes(UserType.DOCTOR),
  validate(conversationRepliesSchema),
  chatController.updateConversationReplies,
);

export default router;
