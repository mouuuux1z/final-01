import { z } from 'zod';
export declare const listNotificationsQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    unreadOnly: z.ZodEffects<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"true">, z.ZodLiteral<"false">, z.ZodBoolean]>>, boolean, boolean | "true" | "false">;
}, "strip", z.ZodTypeAny, {
    limit?: number;
    page?: number;
    unreadOnly?: boolean;
}, {
    limit?: number;
    page?: number;
    unreadOnly?: boolean | "true" | "false";
}>;
export declare const notificationIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id?: string;
}, {
    id?: string;
}>;
export declare const markAllReadSchema: z.ZodOptional<z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>>;
