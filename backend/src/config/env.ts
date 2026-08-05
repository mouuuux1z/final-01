import { config } from 'dotenv';
import path from 'node:path';
import { z } from 'zod';

const backendRoot = path.resolve(__dirname, '../..');
config({ path: path.join(backendRoot, '.env') });

function stripQuotes(value: string): string {
  return value.replace(/^["']|["']$/g, '');
}

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1),
  DIRECT_DATABASE_URL: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_FILE_SIZE: z.coerce.number().default(5_242_880),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
  SMTP_PASS: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
  EMAIL_FROM: z
    .string()
    .default('MYDoc <mydoc2contact@gmail.com>')
    .transform(stripQuotes),
  PASSWORD_RESET_CODE_EXPIRES_IN: z.string().default('15m'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

if (!env.SMTP_USER && env.NODE_ENV === 'development') {
  console.warn('[env] SMTP_USER is missing in backend/.env — password reset codes will print to the console only.');
}
