import { z } from 'zod';
import { SenderType } from '@prisma/client';

export const sendMessageSchema = z.object({
  doctorId: z.string().uuid(),
  patientId: z.string().uuid(),
  message: z.string().min(1).max(5000),
});

export const conversationQuerySchema = z.object({
  doctorId: z.string().uuid(),
  patientId: z.string().uuid(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

export const conversationRepliesSchema = z.object({
  doctorId: z.string().uuid(),
  patientId: z.string().uuid(),
  repliesEnabled: z.boolean(),
});

export const conversationSettingsQuerySchema = z.object({
  doctorId: z.string().uuid(),
  patientId: z.string().uuid(),
});

export const markReadSchema = z.object({
  doctorId: z.string().uuid(),
  patientId: z.string().uuid(),
});

export const listConversationsQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

export const chatAccessQuerySchema = z.object({
  doctorId: z.string().uuid(),
  patientId: z.string().uuid(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
