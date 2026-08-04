import type { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { parseIdParam } from '../../utils/params.js';
import { queueService } from './queue.service.js';

export class QueueController {
  getTodayQueue = asyncHandler(async (req: Request, res: Response) => {
    const queue = await queueService.getTodayQueue(req.user!.id);
    sendSuccess(res, queue);
  });

  startReception = asyncHandler(async (req: Request, res: Response) => {
    const queue = await queueService.startReception(req.user!.id);
    sendSuccess(res, queue, 'Reception started');
  });

  advanceQueue = asyncHandler(async (req: Request, res: Response) => {
    const queue = await queueService.advanceQueue(req.user!.id);
    sendSuccess(res, queue, 'Queue advanced');
  });

  getAppointmentQueueStatus = asyncHandler(async (req: Request, res: Response) => {
    const status = await queueService.getAppointmentQueueStatus(
      parseIdParam(req.params.id, 'id'),
      req.user!.id,
      req.user!.userType,
    );
    sendSuccess(res, status);
  });
}

export const queueController = new QueueController();
