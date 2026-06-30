import { z } from 'zod';
export declare const sendMessageSchema: z.ZodObject<{
    doctorId: z.ZodString;
    patientId: z.ZodString;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message?: string;
    doctorId?: string;
    patientId?: string;
}, {
    message?: string;
    doctorId?: string;
    patientId?: string;
}>;
export declare const conversationQuerySchema: z.ZodObject<{
    doctorId: z.ZodString;
    patientId: z.ZodString;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit?: number;
    doctorId?: string;
    patientId?: string;
    page?: number;
}, {
    limit?: number;
    doctorId?: string;
    patientId?: string;
    page?: number;
}>;
export declare const conversationRepliesSchema: z.ZodObject<{
    doctorId: z.ZodString;
    patientId: z.ZodString;
    repliesEnabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    doctorId?: string;
    patientId?: string;
    repliesEnabled?: boolean;
}, {
    doctorId?: string;
    patientId?: string;
    repliesEnabled?: boolean;
}>;
export declare const conversationSettingsQuerySchema: z.ZodObject<{
    doctorId: z.ZodString;
    patientId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    doctorId?: string;
    patientId?: string;
}, {
    doctorId?: string;
    patientId?: string;
}>;
export declare const markReadSchema: z.ZodObject<{
    doctorId: z.ZodString;
    patientId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    doctorId?: string;
    patientId?: string;
}, {
    doctorId?: string;
    patientId?: string;
}>;
export declare const listConversationsQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit?: number;
    page?: number;
}, {
    limit?: number;
    page?: number;
}>;
export declare const chatAccessQuerySchema: z.ZodObject<{
    doctorId: z.ZodString;
    patientId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    doctorId?: string;
    patientId?: string;
}, {
    doctorId?: string;
    patientId?: string;
}>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
