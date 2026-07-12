import { AppError } from './AppError.js';

export function parseIdParam(value: string | string[] | undefined, label = 'id'): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || raw.trim().length === 0) {
    throw new AppError(`Invalid ${label}`, 400);
  }
  return raw;
}

export function parseOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
