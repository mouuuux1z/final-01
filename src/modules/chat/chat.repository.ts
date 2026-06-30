import { Prisma, SenderType } from '@prisma/client';
import { prisma } from '../../config/database.js';
import type { PaginationParams } from '../../utils/pagination.js';

export class ChatRepository {
  async hasDoctorInitiatedConversation(doctorId: string, patientId: string): Promise<boolean> {
    const count = await prisma.chatMessage.count({
      where: { doctorId, patientId, senderType: SenderType.DOCTOR },
    });
    return count > 0;
  }

  async getConversation(doctorId: string, patientId: string, pagination: PaginationParams) {
    const where: Prisma.ChatMessageWhereInput = { doctorId, patientId };
    const [items, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.chatMessage.count({ where }),
    ]);
    return { items: items.reverse(), total };
  }

  async createMessage(data: {
    doctorId: string;
    patientId: string;
    senderType: SenderType;
    message: string;
    fileUrl?: string;
  }) {
    return prisma.chatMessage.create({ data });
  }

  async markAsRead(doctorId: string, patientId: string, readerType: SenderType) {
    const senderType = readerType === SenderType.DOCTOR ? SenderType.PATIENT : SenderType.DOCTOR;
    return prisma.chatMessage.updateMany({
      where: { doctorId, patientId, senderType, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async getDoctorConversations(doctorId: string, pagination: PaginationParams) {
    const messages = await prisma.chatMessage.findMany({
      where: { doctorId },
      distinct: ['patientId'],
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
      include: {
        patient: { select: { id: true, name: true, phone: true } },
      },
    });

    const total = await prisma.chatMessage.groupBy({
      by: ['patientId'],
      where: { doctorId },
    });

    return { items: messages, total: total.length };
  }

  async getPatientConversations(patientId: string, pagination: PaginationParams) {
    const messages = await prisma.chatMessage.findMany({
      where: { patientId },
      distinct: ['doctorId'],
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
      include: {
        doctor: { select: { id: true, name: true, specialization: true, image: true } },
      },
    });

    const total = await prisma.chatMessage.groupBy({
      by: ['doctorId'],
      where: { patientId },
    });

    return { items: messages, total: total.length };
  }

  async getConversationRepliesEnabled(doctorId: string, patientId: string): Promise<boolean> {
    const settings = await prisma.chatConversationSettings.findUnique({
      where: { doctorId_patientId: { doctorId, patientId } },
    });
    return settings?.repliesEnabled ?? false;
  }

  async upsertConversationSettings(doctorId: string, patientId: string, repliesEnabled: boolean) {
    return prisma.chatConversationSettings.upsert({
      where: { doctorId_patientId: { doctorId, patientId } },
      create: { doctorId, patientId, repliesEnabled },
      update: { repliesEnabled },
    });
  }
}

export const chatRepository = new ChatRepository();
