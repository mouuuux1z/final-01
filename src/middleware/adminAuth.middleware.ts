import type { NextFunction, Request, Response } from 'express';
import { UserType } from '@prisma/client';
import { AppError } from '../utils/AppError.js';
import { authMiddleware, requireUserTypes } from './auth.middleware.js';

export const adminAuthMiddleware = [authMiddleware, requireUserTypes(UserType.ADMIN)];

export function adminOnly(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user || req.user.userType !== UserType.ADMIN) {
    next(new AppError('Admin access required', 403));
    return;
  }
  next();
}
