import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

type RequestPart = 'body' | 'query' | 'params';

function isStructuredArray(values: unknown[]): boolean {
  return values.some((item) => typeof item === 'object' && item !== null);
}

function normalizeRequestPart(value: Request[RequestPart]): Request[RequestPart] {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return value;
  }

  const normalized: Record<string, unknown> = {};
  for (const [key, partValue] of Object.entries(value)) {
    if (Array.isArray(partValue)) {
      // Keep JSON arrays like `{ days: [{ ... }] }`; collapse duplicate query params.
      normalized[key] = isStructuredArray(partValue) ? partValue : partValue[0];
      continue;
    }
    normalized[key] = partValue;
  }
  return normalized as Request[RequestPart];
}

export function validate(schema: ZodSchema, part: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(normalizeRequestPart(req[part]));
    if (!result.success) {
      next(result.error);
      return;
    }
    req[part] = result.data;
    next();
  };
}
