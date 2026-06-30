import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

type RequestPart = 'body' | 'query' | 'params';

function normalizeRequestPart(value: Request[RequestPart]): Request[RequestPart] {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return value;
  }

  const normalized: Record<string, unknown> = {};
  for (const [key, partValue] of Object.entries(value)) {
    normalized[key] = Array.isArray(partValue) ? partValue[0] : partValue;
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
