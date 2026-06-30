import { z } from 'zod';

export const updatePatientSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(8).max(20).optional(),
});

export const patientIdParamSchema = z.object({
  id: z.string().uuid(),
});
