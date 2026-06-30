import { Prisma, SenderType } from '@prisma/client';
import type { PaginationParams } from '../../utils/pagination.js';
export declare class ChatRepository {
    hasDoctorInitiatedConversation(doctorId: string, patientId: string): Promise<boolean>;
    getConversation(doctorId: string, patientId: string, pagination: PaginationParams): Promise<{
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
        total: number;
    }>;
    createMessage(data: {
        doctorId: string;
        patientId: string;
        senderType: SenderType;
        message: string;
        fileUrl?: string;
    }): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        doctorId: string;
        patientId: string;
        senderType: import("@prisma/client").$Enums.SenderType;
        fileUrl: string | null;
        readAt: Date | null;
    }>;
    markAsRead(doctorId: string, patientId: string, readerType: SenderType): Promise<Prisma.BatchPayload>;
    getDoctorConversations(doctorId: string, pagination: PaginationParams): Promise<{
        items: ({
            patient: {
                name: string;
                id: string;
                phone: string;
            };
        } & {
            message: string;
            id: string;
            createdAt: Date;
            doctorId: string;
            patientId: string;
            senderType: import("@prisma/client").$Enums.SenderType;
            fileUrl: string | null;
            readAt: Date | null;
        })[];
        total: number;
    }>;
    getPatientConversations(patientId: string, pagination: PaginationParams): Promise<{
        items: ({
            doctor: {
                name: string;
                id: string;
                specialization: string;
                image: string;
            };
        } & {
            message: string;
            id: string;
            createdAt: Date;
            doctorId: string;
            patientId: string;
            senderType: import("@prisma/client").$Enums.SenderType;
            fileUrl: string | null;
            readAt: Date | null;
        })[];
        total: number;
    }>;
    getConversationRepliesEnabled(doctorId: string, patientId: string): Promise<boolean>;
    upsertConversationSettings(doctorId: string, patientId: string, repliesEnabled: boolean): Promise<{
        id: string;
        doctorId: string;
        patientId: string;
        repliesEnabled: boolean;
    }>;
}
export declare const chatRepository: ChatRepository;
