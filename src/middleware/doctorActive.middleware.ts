import type { NextFunction, Request, Response } from 'express';
import { EntityStatus, UserType } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';

export async function requireActiveDoctor(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user || req.user.userType !== UserType.DOCTOR) {
      next();
      return;
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: req.user.id },
      select: { status: true },
    });

    if (!doctor || doctor.status !== EntityStatus.ACTIVE) {
      next(new AppError('Doctor account is not active', 403));
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}
