"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRepository = exports.ChatRepository = void 0;
const client_1 = require("@prisma/client");
const database_js_1 = require("../../config/database.js");
class ChatRepository {
    async hasDoctorInitiatedConversation(doctorId, patientId) {
        const count = await database_js_1.prisma.chatMessage.count({
            where: { doctorId, patientId, senderType: client_1.SenderType.DOCTOR },
        });
        return count > 0;
    }
    async getConversation(doctorId, patientId, pagination) {
        const where = { doctorId, patientId };
        const [items, total] = await Promise.all([
            database_js_1.prisma.chatMessage.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { createdAt: 'desc' },
            }),
            database_js_1.prisma.chatMessage.count({ where }),
        ]);
        return { items: items.reverse(), total };
    }
    async createMessage(data) {
        return database_js_1.prisma.chatMessage.create({ data });
    }
    async markAsRead(doctorId, patientId, readerType) {
        const senderType = readerType === client_1.SenderType.DOCTOR ? client_1.SenderType.PATIENT : client_1.SenderType.DOCTOR;
        return database_js_1.prisma.chatMessage.updateMany({
            where: { doctorId, patientId, senderType, readAt: null },
            data: { readAt: new Date() },
        });
    }
    async getDoctorConversations(doctorId, pagination) {
        const messages = await database_js_1.prisma.chatMessage.findMany({
            where: { doctorId },
            distinct: ['patientId'],
            orderBy: { createdAt: 'desc' },
            skip: pagination.skip,
            take: pagination.limit,
            include: {
                patient: { select: { id: true, name: true, phone: true } },
            },
        });
        const total = await database_js_1.prisma.chatMessage.groupBy({
            by: ['patientId'],
            where: { doctorId },
        });
        return { items: messages, total: total.length };
    }
    async getPatientConversations(patientId, pagination) {
        const messages = await database_js_1.prisma.chatMessage.findMany({
            where: { patientId },
            distinct: ['doctorId'],
            orderBy: { createdAt: 'desc' },
            skip: pagination.skip,
            take: pagination.limit,
            include: {
                doctor: { select: { id: true, name: true, specialization: true, image: true } },
            },
        });
        const total = await database_js_1.prisma.chatMessage.groupBy({
            by: ['doctorId'],
            where: { patientId },
        });
        return { items: messages, total: total.length };
    }
    async getConversationRepliesEnabled(doctorId, patientId) {
        const settings = await database_js_1.prisma.chatConversationSettings.findUnique({
            where: { doctorId_patientId: { doctorId, patientId } },
        });
        return settings?.repliesEnabled ?? false;
    }
    async upsertConversationSettings(doctorId, patientId, repliesEnabled) {
        return database_js_1.prisma.chatConversationSettings.upsert({
            where: { doctorId_patientId: { doctorId, patientId } },
            create: { doctorId, patientId, repliesEnabled },
            update: { repliesEnabled },
        });
    }
}
exports.ChatRepository = ChatRepository;
exports.chatRepository = new ChatRepository();
//# sourceMappingURL=chat.repository.js.map