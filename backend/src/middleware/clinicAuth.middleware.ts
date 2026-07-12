import type { NextFunction, Request, Response } from 'express';
import { UserType } from '@prisma/client';
import { AppError } from '../utils/AppError.js';
import { authMiddleware, requireUserTypes } from './auth.middleware.js';

export const clinicAuthMiddleware = [authMiddleware, requireUserTypes(UserType.CLINIC)];

export function clinicOnly(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user || req.user.userType !== UserType.CLINIC) {
    next(new AppError('Clinic access required', 403));
    return;
  }
  next();
}
