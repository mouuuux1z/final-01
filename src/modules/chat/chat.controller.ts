import type { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getFileUrl } from '../../middleware/upload.middleware.js';
import { chatService } from './chat.service.js';

export class ChatController {
  listConversations = asyncHandler(async (req: Request, res: Response) => {
    const result = await chatService.listConversations(
      req.user!.id,
      req.user!.userType,
      req.query as Record<string, unknown>,
    );
    sendSuccess(res, result);
  });

  getConversation = asyncHandler(async (req: Request, res: Response) => {
    const result = await chatService.getConversation(
      req.query.doctorId as string,
      req.query.patientId as string,
      req.user!.id,
      req.user!.userType,
      req.query as Record<string, unknown>,
    );
    sendSuccess(res, result);
  });

  sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const file = req.file;
    const fileUrl = file?.filename ? getFileUrl(file.filename) : undefined;
    const message = await chatService.sendMessage(req.body, req.user!.id, req.user!.userType, fileUrl);
    sendSuccess(res, message, 'Message sent', 201);
  });

  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const result = await chatService.markAsRead(
      req.body.doctorId,
      req.body.patientId,
      req.user!.id,
      req.user!.userType,
    );
    sendSuccess(res, result, 'Messages marked as read');
  });

  getConversationReplies = asyncHandler(async (req: Request, res: Response) => {
    const settings = await chatService.getConversationReplies(
      req.query.doctorId as string,
      req.query.patientId as string,
      req.user!.id,
      req.user!.userType,
    );
    sendSuccess(res, settings);
  });

  updateConversationReplies = asyncHandler(async (req: Request, res: Response) => {
    const settings = await chatService.updateConversationReplies(
      req.body.doctorId,
      req.body.patientId,
      req.body.repliesEnabled,
      req.user!.id,
      req.user!.userType,
    );
    sendSuccess(res, settings, 'Conversation replies updated');
  });

  getAccess = asyncHandler(async (req: Request, res: Response) => {
    const access = await chatService.getChatAccess(
      req.query.doctorId as string,
      req.query.patientId as string,
      req.user!.id,
      req.user!.userType,
    );
    sendSuccess(res, access);
  });
}

export const chatController = new ChatController();
