import { UserType } from '@prisma/client';
import type { SendMessageInput } from './chat.schema.js';
export declare class ChatService {
    getConversation(doctorId: string, patientId: string, userId: string, userType: UserType, query: Record<string, unknown>): Promise<{
        items: {
            message: string;
            id: string;
            createdAt: Date;
            doctorId: string;
            patientId: string;
            senderType: import("@prisma/client").$Enums.SenderType;
            fileUrl: string | null;
            readAt: Date | null;
        }[];
        meta: import("../../utils/pagination.js").PaginationMeta;
    }>;
    sendMessage(input: SendMessageInput, userId: string, userType: UserType, fileUrl?: string): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        doctorId: string;
        patientId: string;
        senderType: import("@prisma/client").$Enums.SenderType;
        fileUrl: string | null;
        readAt: Date | null;
    }>;
    markAsRead(doctorId: string, patientId: string, userId: string, userType: UserType): Promise<import("@prisma/client").Prisma.BatchPayload>;
    listConversations(userId: string, userType: UserType, query: Record<string, unknown>): Promise<{
        items: any[];
        meta: import("../../utils/pagination.js").PaginationMeta;
    }>;
    updateConversationReplies(doctorId: string, patientId: string, repliesEnabled: boolean, userId: string, userType: UserType): Promise<{
        id: string;
        doctorId: string;
        patientId: string;
        repliesEnabled: boolean;
    }>;
    getConversationReplies(doctorId: string, patientId: string, userId: string, userType: UserType): Promise<{
        doctorId: string;
        patientId: string;
        repliesEnabled: boolean;
    }>;
    getChatAccess(doctorId: string, patientId: string, userId: string, userType: UserType): Promise<{
        initiated: boolean;
        repliesEnabled: boolean;
        canPatientReply: boolean;
    }>;
    private assertConversationAccess;
}
export declare const chatService: ChatService;
