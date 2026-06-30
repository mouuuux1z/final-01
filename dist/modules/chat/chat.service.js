"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = exports.ChatService = void 0;
const client_1 = require("@prisma/client");
const database_js_1 = require("../../config/database.js");
const AppError_js_1 = require("../../utils/AppError.js");
const pagination_js_1 = require("../../utils/pagination.js");
const emitter_js_1 = require("../../websocket/emitter.js");
const events_js_1 = require("../../websocket/events.js");
const chat_repository_js_1 = require("./chat.repository.js");
class ChatService {
    async getConversation(doctorId, patientId, userId, userType, query) {
        this.assertConversationAccess(doctorId, patientId, userId, userType);
        if (userType === client_1.UserType.PATIENT) {
            const initiated = await chat_repository_js_1.chatRepository.hasDoctorInitiatedConversation(doctorId, patientId);
            if (!initiated) {
                throw new AppError_js_1.AppError('Doctor has not started this conversation yet', 403);
            }
        }
        const pagination = (0, pagination_js_1.parsePagination)(query);
        const { items, total } = await chat_repository_js_1.chatRepository.getConversation(doctorId, patientId, pagination);
        return { items, meta: (0, pagination_js_1.buildPaginationMeta)(pagination.page, pagination.limit, total) };
    }
    async sendMessage(input, userId, userType, fileUrl) {
        this.assertConversationAccess(input.doctorId, input.patientId, userId, userType);
        if (userType === client_1.UserType.PATIENT) {
            const initiated = await chat_repository_js_1.chatRepository.hasDoctorInitiatedConversation(input.doctorId, input.patientId);
            if (!initiated) {
                throw new AppError_js_1.AppError('Only the doctor can start a conversation', 403);
            }
            const repliesEnabled = await chat_repository_js_1.chatRepository.getConversationRepliesEnabled(input.doctorId, input.patientId);
            if (!repliesEnabled) {
                throw new AppError_js_1.AppError('Doctor is not accepting replies', 403);
            }
        }
        const senderType = userType === client_1.UserType.DOCTOR ? client_1.SenderType.DOCTOR : client_1.SenderType.PATIENT;
        const message = await chat_repository_js_1.chatRepository.createMessage({
            doctorId: input.doctorId,
            patientId: input.patientId,
            message: input.message,
            senderType,
            fileUrl,
        });
        const targetType = userType === client_1.UserType.DOCTOR ? client_1.UserType.PATIENT : client_1.UserType.DOCTOR;
        const targetId = userType === client_1.UserType.DOCTOR ? input.patientId : input.doctorId;
        await database_js_1.prisma.notification.create({
            data: {
                targetType: targetType,
                targetId,
                title: 'New message',
                message: input.message.slice(0, 100),
                type: client_1.NotificationType.CHAT,
            },
        });
        (0, emitter_js_1.emitToUser)(targetType, targetId, events_js_1.SocketEvents.CHAT_MESSAGE, message);
        (0, emitter_js_1.emitToUser)(userType, userId, events_js_1.SocketEvents.CHAT_MESSAGE, message);
        if (userType === client_1.UserType.PATIENT) {
            const doctor = await database_js_1.prisma.doctor.findUnique({
                where: { id: input.doctorId },
                select: { clinicId: true },
            });
            if (doctor?.clinicId) {
                (0, emitter_js_1.emitToUser)(client_1.UserType.CLINIC, doctor.clinicId, events_js_1.SocketEvents.CHAT_MESSAGE, message);
            }
        }
        return message;
    }
    async markAsRead(doctorId, patientId, userId, userType) {
        this.assertConversationAccess(doctorId, patientId, userId, userType);
        const readerType = userType === client_1.UserType.DOCTOR ? client_1.SenderType.DOCTOR : client_1.SenderType.PATIENT;
        return chat_repository_js_1.chatRepository.markAsRead(doctorId, patientId, readerType);
    }
    async listConversations(userId, userType, query) {
        const pagination = (0, pagination_js_1.parsePagination)(query);
        if (userType === client_1.UserType.DOCTOR) {
            const { items, total } = await chat_repository_js_1.chatRepository.getDoctorConversations(userId, pagination);
            return { items, meta: (0, pagination_js_1.buildPaginationMeta)(pagination.page, pagination.limit, total) };
        }
        if (userType === client_1.UserType.PATIENT) {
            const { items, total } = await chat_repository_js_1.chatRepository.getPatientConversations(userId, pagination);
            const initiatedItems = [];
            for (const item of items) {
                const initiated = await chat_repository_js_1.chatRepository.hasDoctorInitiatedConversation(item.doctorId, userId);
                if (initiated)
                    initiatedItems.push(item);
            }
            return {
                items: initiatedItems,
                meta: (0, pagination_js_1.buildPaginationMeta)(pagination.page, pagination.limit, initiatedItems.length),
            };
        }
        throw new AppError_js_1.AppError('Forbidden', 403);
    }
    async updateConversationReplies(doctorId, patientId, repliesEnabled, userId, userType) {
        if (userType !== client_1.UserType.DOCTOR || userId !== doctorId) {
            throw new AppError_js_1.AppError('Forbidden', 403);
        }
        return chat_repository_js_1.chatRepository.upsertConversationSettings(doctorId, patientId, repliesEnabled);
    }
    async getConversationReplies(doctorId, patientId, userId, userType) {
        this.assertConversationAccess(doctorId, patientId, userId, userType);
        const repliesEnabled = await chat_repository_js_1.chatRepository.getConversationRepliesEnabled(doctorId, patientId);
        return { doctorId, patientId, repliesEnabled };
    }
    async getChatAccess(doctorId, patientId, userId, userType) {
        this.assertConversationAccess(doctorId, patientId, userId, userType);
        const initiated = await chat_repository_js_1.chatRepository.hasDoctorInitiatedConversation(doctorId, patientId);
        const repliesEnabled = await chat_repository_js_1.chatRepository.getConversationRepliesEnabled(doctorId, patientId);
        return {
            initiated,
            repliesEnabled,
            canPatientReply: initiated && repliesEnabled,
        };
    }
    assertConversationAccess(doctorId, patientId, userId, userType) {
        if (userType === client_1.UserType.DOCTOR && userId !== doctorId) {
            throw new AppError_js_1.AppError('Forbidden', 403);
        }
        if (userType === client_1.UserType.PATIENT && userId !== patientId) {
            throw new AppError_js_1.AppError('Forbidden', 403);
        }
        if (userType !== client_1.UserType.DOCTOR && userType !== client_1.UserType.PATIENT) {
            throw new AppError_js_1.AppError('Forbidden', 403);
        }
    }
}
exports.ChatService = ChatService;
exports.chatService = new ChatService();
//# sourceMappingURL=chat.service.js.map