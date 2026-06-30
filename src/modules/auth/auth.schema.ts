import { z } from 'zod';
import { UserType } from '@prisma/client';

export const registerSchema = z.discriminatedUnion('userType', [
  z.object({
    userType: z.literal(UserType.PATIENT),
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(128),
    phone: z.string().min(8).max(20),
  }),
  z.object({
    userType: z.literal(UserType.DOCTOR),
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(128),
    phone: z.string().min(8).max(20),
    specialization: z.string().min(2).max(100),
    city: z.string().min(2).max(100),
    location: z.string().min(2).max(200),
    clinicInfo: z.string().max(1000).optional(),
    description: z.string().max(2000).optional(),
    clinicId: z.string().uuid().optional(),
  }),
  z.object({
    userType: z.literal(UserType.CLINIC),
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(128),
    phone: z.string().min(8).max(20),
    location: z.string().min(2).max(200),
    city: z.string().min(2).max(100),
    specialization: z.string().min(2).max(100),
  }),
]);

export const loginSchema = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1),
  userType: z.nativeEnum(UserType).optional(),
});

export const doctorRegisterMultipartSchema = z.object({
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

export const clinicRegisterMultipartSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z.string().min(8).max(20),
  city: z.string().min(2).max(100),
  location: z.string().min(2).max(200),
  specialization: z.string().min(2).max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ClinicRegisterInput = z.infer<typeof clinicRegisterMultipartSchema>;
