import { z } from 'zod';
import { DayOfWeek, EntityStatus } from '@prisma/client';
import { normalizeTimeString, parseLocalDateInput, parseTimeToMinutes } from '../../utils/slotGenerator.js';

function emptyToUndefined(value: unknown): unknown {
  if (value === '' || value === null || value === undefined) return undefined;
  return value;
}

function optionalCoercedInt(min: number, max: number) {
  return z.preprocess(emptyToUndefined, z.coerce.number().int().min(min).max(max).optional());
}

const timeStringSchema = z
  .string()
  .min(1)
  .transform((value) => normalizeTimeString(value))
  .pipe(z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'));

const optionalTimeStringSchema = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? normalizeTimeString(value.trim()) : undefined)),
);

export const searchDoctorsSchema = z.object({
  q: z.string().optional(),
  city: z.string().optional(),
  specialization: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

export const updateDoctorSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(8).max(20).optional(),
  specialization: z.string().min(2).max(100).optional(),
  city: z.string().min(2).max(100).optional(),
  location: z.string().min(2).max(200).optional(),
  clinicInfo: z.string().max(1000).optional(),
  description: z.string().max(2000).optional(),
  clinicId: z.string().uuid().nullable().optional(),
});

export const adminUpdateDoctorSchema = updateDoctorSchema.extend({
  status: z.nativeEnum(EntityStatus).optional(),
  disableReason: z.string().max(1000).nullable().optional(),
});

const scheduleTimeFieldsSchema = z.object({
  startTime: timeStringSchema,
  endTime: timeStringSchema,
});

function refineScheduleTimeRange<T extends z.ZodTypeAny>(schema: T) {
  return schema.refine(
    (data: { startTime: string; endTime: string }) =>
      parseTimeToMinutes(data.startTime) < parseTimeToMinutes(data.endTime),
    { message: 'End time must be after start time' },
  );
}

export const createScheduleSchema = refineScheduleTimeRange(
  scheduleTimeFieldsSchema.extend({
    dayOfWeek: z.nativeEnum(DayOfWeek),
  }),
);

export const updateScheduleSchema = z
  .object({
    startTime: timeStringSchema.optional(),
    endTime: timeStringSchema.optional(),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;
      return parseTimeToMinutes(data.startTime) < parseTimeToMinutes(data.endTime);
    },
    { message: 'End time must be after start time' },
  );

export const syncWeeklySchedulesSchema = z.object({
  days: z
    .array(
      refineScheduleTimeRange(
        scheduleTimeFieldsSchema.extend({
          dayOfWeek: z.nativeEnum(DayOfWeek),
        }),
      ),
    )
    .min(1)
    .max(7),
});

export const createAvailabilitySlotSchema = z.object({
  date: z.coerce.date(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});

export const bulkAvailabilitySchema = z.object({
  date: z.coerce.date(),
  times: z.array(z.string().regex(/^\d{2}:\d{2}$/)).min(1),
});

export const generateAvailabilitySchema = z
  .object({
    date: z.coerce.date(),
    startTime: timeStringSchema,
    endTime: timeStringSchema,
    slotDurationMinutes: z.coerce.number().int().min(5).max(240).optional().default(30),
    gapMinutes: z.coerce.number().int().min(0).max(120).optional().default(0),
    breakStart: optionalTimeStringSchema,
    breakEnd: optionalTimeStringSchema,
  })
  .refine((data) => parseTimeToMinutes(data.startTime) < parseTimeToMinutes(data.endTime), {
    message: 'End time must be after start time',
  });

export const onlineStatusSchema = z.object({
  isOnline: z.boolean(),
});

export const doctorIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const scheduleIdParamSchema = z.object({
  scheduleId: z.string().uuid(),
});

export const slotIdParamSchema = z.object({
  slotId: z.string().uuid(),
});

export type GenerateAvailabilityInput = z.infer<typeof generateAvailabilitySchema>;

export const generateRecurringAvailabilitySchema = z
  .object({
    daysOfWeek: z.array(z.nativeEnum(DayOfWeek)).min(1),
    startTime: timeStringSchema,
    endTime: timeStringSchema,
    slotDurationMinutes: z.coerce.number().int().min(5).max(240).optional().default(30),
    gapMinutes: z.coerce.number().int().min(0).max(120).optional().default(0),
    breakStart: optionalTimeStringSchema,
    breakEnd: optionalTimeStringSchema,
    weeksAhead: z.coerce.number().int().min(1).max(12).optional().default(8),
  })
  .refine((data) => parseTimeToMinutes(data.startTime) < parseTimeToMinutes(data.endTime), {
    message: 'End time must be after start time',
  })
  .refine(
    (data) => {
      const hasBreakStart = Boolean(data.breakStart);
      const hasBreakEnd = Boolean(data.breakEnd);
      return hasBreakStart === hasBreakEnd;
    },
    { message: 'Break start and end must both be provided', path: ['breakStart'] },
  );

export type GenerateRecurringAvailabilityInput = z.infer<typeof generateRecurringAvailabilitySchema>;

export const generateFromWeeklyScheduleSchema = z
  .object({
    slotDurationMinutes: optionalCoercedInt(5, 240).default(30),
    gapMinutes: optionalCoercedInt(0, 120).default(0),
    breakStart: optionalTimeStringSchema,
    breakEnd: optionalTimeStringSchema,
    daysAhead: optionalCoercedInt(1, 84).default(7),
  })
  .refine(
    (data) => {
      const hasBreakStart = Boolean(data.breakStart);
      const hasBreakEnd = Boolean(data.breakEnd);
      return hasBreakStart === hasBreakEnd;
    },
    { message: 'Break start and end must both be provided', path: ['breakStart'] },
  );

export type GenerateFromWeeklyScheduleInput = z.infer<typeof generateFromWeeklyScheduleSchema>;

export const availabilityQuerySchema = z.object({
  date: z.preprocess(parseLocalDateInput, z.date().optional()),
  from: z.preprocess(parseLocalDateInput, z.date().optional()),
  to: z.preprocess(parseLocalDateInput, z.date().optional()),
  availableOnly: z.coerce.boolean().optional(),
});
