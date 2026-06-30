import {
  NotificationTargetType,
  NotificationType,
  SenderType,
  UserType,
} from '@prisma/client';
import { prisma } from '../../config/database.js';
import { AppError } from '../../utils/AppError.js';
import { buildPaginationMeta, parsePagination } from '../../utils/pagination.js';
import { emitToUser } from '../../websocket/emitter.js';
import { SocketEvents } from '../../websocket/events.js';
import { chatRepository } from './chat.repository.js';
import type { SendMessageInput } from './chat.schema.js';

export class ChatService {
  async getConversation(
    doctorId: string,
    patientId: string,
    userId: string,
    userType: UserType,
    query: Record<string, unknown>,
  ) {
    this.assertConversationAccess(doctorId, patientId, userId, userType);

    if (userType === UserType.PATIENT) {
      const initiated = await chatRepository.hasDoctorInitiatedConversation(doctorId, patientId);
      if (!initiated) {
        throw new AppError('Doctor has not started this conversation yet', 403);
      }
    }

    const pagination = parsePagination(query);
    const { items, total } = await chatRepository.getConversation(doctorId, patientId, pagination);
    return { items, meta: buildPaginationMeta(pagination.page, pagination.limit, total) };
  }

  async sendMessage(
    input: SendMessageInput,
    userId: string,
    userType: UserType,
    fileUrl?: string,
  ) {
    this.assertConversationAccess(input.doctorId, input.patientId, userId, userType);

    if (userType === UserType.PATIENT) {
      const initiated = await chatRepository.hasDoctorInitiatedConversation(
        input.doctorId,
        input.patientId,
      );
      if (!initiated) {
        throw new AppError('Only the doctor can start a conversation', 403);
      }

      const repliesEnabled = await chatRepository.getConversationRepliesEnabled(
        input.doctorId,
        input.patientId,
      );
      if (!repliesEnabled) {
        throw new AppError('Doctor is not accepting replies', 403);
      }
    }

    const senderType = userType === UserType.DOCTOR ? SenderType.DOCTOR : SenderType.PATIENT;
    const message = await chatRepository.createMessage({
      doctorId: input.doctorId,
      patientId: input.patientId,
      message: input.message,
      senderType,
      fileUrl,
    });

    const targetType = userType === UserType.DOCTOR ? UserType.PATIENT : UserType.DOCTOR;
    const targetId = userType === UserType.DOCTOR ? input.patientId : input.doctorId;

    await prisma.notification.create({
      data: {
        targetType: targetType as NotificationTargetType,
        targetId,
        title: 'New message',
        message: input.message.slice(0, 100),
        type: NotificationType.CHAT,
      },
    });

    emitToUser(targetType, targetId, SocketEvents.CHAT_MESSAGE, message);
    emitToUser(userType, userId, SocketEvents.CHAT_MESSAGE, message);

    if (userType === UserType.PATIENT) {
      const doctor = await prisma.doctor.findUnique({
        where: { id: input.doctorId },
        select: { clinicId: true },
      });
      if (doctor?.clinicId) {
        emitToUser(UserType.CLINIC, doctor.clinicId, SocketEvents.CHAT_MESSAGE, message);
      }
    }

    return message;
  }

  async markAsRead(doctorId: string, patientId: string, userId: string, userType: UserType) {
    this.assertConversationAccess(doctorId, patientId, userId, userType);
    const readerType = userType === UserType.DOCTOR ? SenderType.DOCTOR : SenderType.PATIENT;
    return chatRepository.markAsRead(doctorId, patientId, readerType);
  }

  async listConversations(userId: string, userType: UserType, query: Record<string, unknown>) {
    const pagination = parsePagination(query);
    if (userType === UserType.DOCTOR) {
      const { items, total } = await chatRepository.getDoctorConversations(userId, pagination);
      return { items, meta: buildPaginationMeta(pagination.page, pagination.limit, total) };
    }
    if (userType === UserType.PATIENT) {
      const { items, total } = await chatRepository.getPatientConversations(userId, pagination);
      const initiatedItems = [];
      for (const item of items) {
        const initiated = await chatRepository.hasDoctorInitiatedConversation(item.doctorId, userId);
        if (initiated) initiatedItems.push(item);
      }
      return {
        items: initiatedItems,
        meta: buildPaginationMeta(pagination.page, pagination.limit, initiatedItems.length),
      };
    }
    throw new AppError('Forbidden', 403);
  }

  async updateConversationReplies(
    doctorId: string,
    patientId: string,
    repliesEnabled: boolean,
    userId: string,
    userType: UserType,
  ) {
    if (userType !== UserType.DOCTOR || userId !== doctorId) {
      throw new AppError('Forbidden', 403);
    }
    return chatRepository.upsertConversationSettings(doctorId, patientId, repliesEnabled);
  }

  async getConversationReplies(
    doctorId: string,
    patientId: string,
    userId: string,
    userType: UserType,
  ) {
    this.assertConversationAccess(doctorId, patientId, userId, userType);
    const repliesEnabled = await chatRepository.getConversationRepliesEnabled(doctorId, patientId);
    return { doctorId, patientId, repliesEnabled };
  }

  async getChatAccess(
    doctorId: string,
    patientId: string,
    userId: string,
    userType: UserType,
  ) {
    this.assertConversationAccess(doctorId, patientId, userId, userType);
    const initiated = await chatRepository.hasDoctorInitiatedConversation(doctorId, patientId);
    const repliesEnabled = await chatRepository.getConversationRepliesEnabled(doctorId, patientId);

    return {
      initiated,
      repliesEnabled,
      canPatientReply: initiated && repliesEnabled,
    };
  }

  private assertConversationAccess(
    doctorId: string,
    patientId: string,
    userId: string,
    userType: UserType,
  ) {
    if (userType === UserType.DOCTOR && userId !== doctorId) {
      throw new AppError('Forbidden', 403);
    }
    if (userType === UserType.PATIENT && userId !== patientId) {
      throw new AppError('Forbidden', 403);
    }
    if (userType !== UserType.DOCTOR && userType !== UserType.PATIENT) {
      throw new AppError('Forbidden', 403);
    }
  }
}

export const chatService = new ChatService();
