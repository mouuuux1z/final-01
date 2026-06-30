import { z } from 'zod';
import { AppointmentStatus, AttendanceStatus } from '@prisma/client';
import { parseLocalDateInput } from '../../utils/slotGenerator.js';

export const bookAppointmentSchema = z.object({
  doctorId: z.string().uuid(),
  date: z.preprocess(parseLocalDateInput, z.date()),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().max(1000).optional(),
  patientName: z.string().max(100).optional(),
  patientPhone: z.string().max(20).optional(),
});

export const doctorManualBookSchema = z.object({
  patientName: z.string().min(2).max(100),
  patientPhone: z.string().max(20).optional(),
  date: z.preprocess(parseLocalDateInput, z.date()),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().max(1000).optional(),
});

export const rescheduleAppointmentSchema = z.object({
  date: z.preprocess(parseLocalDateInput, z.date()),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus),
});

export const updateAttendanceSchema = z.object({
  attendanceStatus: z.nativeEnum(AttendanceStatus),
});

export const appointmentIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const listAppointmentsQuerySchema = z.object({
  status: z.nativeEnum(AppointmentStatus).optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  from: z.preprocess(parseLocalDateInput, z.date().optional()),
  to: z.preprocess(parseLocalDateInput, z.date().optional()),
});
