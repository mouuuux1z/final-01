import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';
import { sendError } from '../utils/apiResponse.js';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  if (err.name === 'MulterError') {
    sendError(res, 'File upload failed. Please upload a valid certificate file.', 400);
    return;
  }

  if (err instanceof SyntaxError && 'status' in err && (err as SyntaxError & { status?: number }).status === 400) {
    sendError(res, 'Invalid request body', 400);
    return;
  }

  if (err instanceof ZodError) {
    sendError(res, 'Validation failed', 422, err.flatten().fieldErrors);
    return;
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    sendError(res, 'Invalid or expired token', 401);
    return;
  }

  console.error('Unhandled error:', err);
  sendError(res, 'Internal server error', 500);
}
