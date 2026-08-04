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

export const createPrivateAppointmentSchema = z
  .object({
    patientName: z.string().max(100).optional(),
    patientPhone: z.string().max(20).optional(),
    patientId: z.string().uuid().optional(),
    date: z.preprocess(parseLocalDateInput, z.date()),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    notes: z.string().max(1000).optional(),
  })
  .refine((data) => Boolean(data.patientId || data.patientName?.trim()), {
    message: 'Patient name or patientId is required',
    path: ['patientName'],
  });

export const updatePrivateAppointmentSchema = z.object({
  patientName: z.string().max(100).optional(),
  patientPhone: z.string().max(20).optional(),
  patientId: z.string().uuid().optional(),
  date: z.preprocess(parseLocalDateInput, z.date()),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().max(1000).optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus),
});

export const updateAttendanceSchema = z.object({
  attendanceStatus: z.enum([
    AttendanceStatus.ATTENDED,
    AttendanceStatus.ABSENT,
    AttendanceStatus.LATE,
  ]),
});

export const appointmentIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const listAppointmentsQuerySchema = z.object({
  status: z.nativeEnum(AppointmentStatus).optional(),
  statuses: z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(',')
            .map((part) => part.trim())
            .filter(Boolean)
        : undefined,
    )
    .pipe(z.array(z.nativeEnum(AppointmentStatus)).optional()),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  from: z.preprocess(parseLocalDateInput, z.date().optional()),
  to: z.preprocess(parseLocalDateInput, z.date().optional()),
  sort: z.enum(['asc', 'desc']).optional(),
  isPrivate: z.enum(['true', 'false']).optional(),
});
