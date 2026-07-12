import { z } from 'zod';
import { EntityStatus } from '@prisma/client';

export const updateClinicSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  location: z.string().min(2).max(200).optional(),
  phone: z.string().min(8).max(20).optional(),
  city: z.string().min(2).max(100).optional(),
  specialization: z.string().min(2).max(100).optional(),
});

export const adminUpdateClinicSchema = updateClinicSchema.extend({
  status: z.nativeEnum(EntityStatus).optional(),
});

export const assignDoctorSchema = z.object({
  doctorId: z.string().uuid(),
});

export const createClinicDoctorSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z.string().min(8).max(20),
  specialization: z.string().min(2).max(100),
  city: z.string().min(2).max(100),
  location: z.string().min(2).max(200),
  clinicInfo: z.string().max(1000).optional(),
  description: z.string().max(2000).optional(),
});

export const clinicDoctorStatusSchema = z.object({
  status: z.enum([EntityStatus.ACTIVE, EntityStatus.DISABLED]),
  disableReason: z.string().max(500).optional().nullable(),
});

export const clinicIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const clinicListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.nativeEnum(EntityStatus).optional(),
});
