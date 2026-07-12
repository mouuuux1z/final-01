import type { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { parseIdParam } from '../../utils/params.js';
import { patientsService } from './patients.service.js';

export class PatientsController {
  getMe = asyncHandler(async (req: Request, res: Response) => {
    const patient = await patientsService.getProfile(req.user!.id);
    sendSuccess(res, patient);
  });

  updateMe = asyncHandler(async (req: Request, res: Response) => {
    const patient = await patientsService.updateProfile(req.user!.id, req.body);
    sendSuccess(res, patient, 'Profile updated');
  });

  adminList = asyncHandler(async (req: Request, res: Response) => {
    const result = await patientsService.listAll(req.query as Record<string, unknown>);
    sendSuccess(res, result);
  });

  adminGet = asyncHandler(async (req: Request, res: Response) => {
    const patient = await patientsService.getProfile(parseIdParam(req.params.id, 'id'));
    sendSuccess(res, patient);
  });

  adminUpdateStatus = asyncHandler(async (req: Request, res: Response) => {
    const patient = await patientsService.updateStatus(parseIdParam(req.params.id, 'id'), req.body.status);
    sendSuccess(res, patient, 'Patient status updated');
  });
}

export const patientsController = new PatientsController();
