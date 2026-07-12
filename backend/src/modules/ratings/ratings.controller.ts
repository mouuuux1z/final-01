import type { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { parseIdParam } from '../../utils/params.js';
import { ratingsService } from './ratings.service.js';

export class RatingsController {
  submit = asyncHandler(async (req: Request, res: Response) => {
    const result = await ratingsService.submit(req.user!.id, parseIdParam(req.params.id, 'id'), req.body);
    sendSuccess(res, result, 'Rating submitted', 201);
  });

  getMyRating = asyncHandler(async (req: Request, res: Response) => {
    const result = await ratingsService.getMyRating(req.user!.id, parseIdParam(req.params.id, 'id'));
    sendSuccess(res, result);
  });

  listByDoctor = asyncHandler(async (req: Request, res: Response) => {
    const result = await ratingsService.listByDoctor(parseIdParam(req.params.id, 'id'), req.query as Record<string, unknown>);
    sendSuccess(res, result);
  });
}

export const ratingsController = new RatingsController();
