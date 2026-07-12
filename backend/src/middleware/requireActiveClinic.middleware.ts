import type { NextFunction, Request, Response } from 'express';
import { EntityStatus } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';

export async function requireActiveClinic(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: req.user!.id },
      select: { status: true },
    });

    if (!clinic) {
      next(new AppError('Clinic not found', 404));
      return;
    }

    if (clinic.status !== EntityStatus.ACTIVE) {
      next(new AppError('Clinic account is not active', 403));
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}
