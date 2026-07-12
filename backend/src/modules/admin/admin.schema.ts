import { z } from 'zod';
import { AdminRole, ComplaintStatus, EntityStatus } from '@prisma/client';

export const createAdminSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.nativeEnum(AdminRole).optional(),
});

export const verifyDoctorSchema = z.object({
  status: z.nativeEnum(EntityStatus),
  disableReason: z.string().max(1000).nullable().optional(),
});

export const updateComplaintSchema = z.object({
  status: z.nativeEnum(ComplaintStatus),
});

export const siteContentSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().min(1),
});

export const analyticsQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const complaintIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const userListQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  status: z.nativeEnum(EntityStatus).optional(),
});
