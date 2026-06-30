import { z } from 'zod';

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  unreadOnly: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .optional()
    .transform((val) => val === true || val === 'true'),
});

export const notificationIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const markAllReadSchema = z.object({}).optional();
