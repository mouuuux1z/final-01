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
    const readAt = new Date();
    const unread = await prisma.chatMessage.findMany({
      where: { doctorId, patientId, senderType, readAt: null },
      select: { id: true },
    });

    if (!unread.length) {
      return { count: 0, messageIds: [] as string[], readAt: null as Date | null, senderType };
    }

    await prisma.chatMessage.updateMany({
      where: { doctorId, patientId, senderType, readAt: null },
      data: { readAt },
    });

    return {
      count: unread.length,
      messageIds: unread.map((item) => item.id),
      readAt,
      senderType,
    };
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

  async getInitiatedDoctorIdsForPatient(patientId: string, doctorIds: string[]): Promise<Set<string>> {
    if (doctorIds.length === 0) return new Set();

    const initiated = await prisma.chatMessage.groupBy({
      by: ['doctorId'],
      where: {
        patientId,
        doctorId: { in: doctorIds },
        senderType: SenderType.DOCTOR,
      },
    });

    return new Set(initiated.map((entry) => entry.doctorId));
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
