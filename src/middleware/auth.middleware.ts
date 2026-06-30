import type { NextFunction, Request, Response } from 'express';
import { UserType } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { verifyToken } from '../utils/jwt.js';

export async function authMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = header.slice(7);
    const payload = verifyToken(token);

    const session = await prisma.session.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
      }
      throw new AppError('Session expired', 401);
    }

    if (session.userId !== payload.userId || session.userType !== payload.userType) {
      throw new AppError('Invalid session', 401);
    }

    req.user = {
      id: payload.userId,
      userType: payload.userType as UserType,
      sessionId: session.id,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(new AppError('Invalid or expired token', 401));
  }
}

export function requireUserTypes(...allowedTypes: UserType[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !allowedTypes.includes(req.user.userType)) {
      next(new AppError('Forbidden', 403));
      return;
    }
    next();
  };
}
