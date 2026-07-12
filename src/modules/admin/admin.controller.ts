import type { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { parseIdParam } from '../../utils/params.js';
import { adminService } from './admin.service.js';
import { authService } from '../auth/auth.service.js';

export class AdminController {
  analytics = asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.getAnalytics(req.query as Record<string, unknown>);
    sendSuccess(res, data);
  });

  listComplaints = asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.listComplaints(req.query as Record<string, unknown>);
    sendSuccess(res, result);
  });

  updateComplaint = asyncHandler(async (req: Request, res: Response) => {
    const admin = await authService.getProfile(req.user!.id, req.user!.userType);
    const complaint = await adminService.updateComplaint(
      parseIdParam(req.params.id, 'id'),
      req.body.status,
      admin.name,
    );
    sendSuccess(res, complaint, 'Complaint updated');
  });

  getSiteContent = asyncHandler(async (_req: Request, res: Response) => {
    const content = await adminService.getSiteContent();
    sendSuccess(res, content);
  });

  upsertSiteContent = asyncHandler(async (req: Request, res: Response) => {
    const admin = await authService.getProfile(req.user!.id, req.user!.userType);
    const content = await adminService.upsertSiteContent(req.body.key, req.body.value, admin.name);
    sendSuccess(res, content, 'Site content updated');
  });

  verifyDoctor = asyncHandler(async (req: Request, res: Response) => {
    const admin = await authService.getProfile(req.user!.id, req.user!.userType);
    const doctor = await adminService.verifyDoctor(
      parseIdParam(req.params.id, 'id'),
      req.body.status,
      admin.name,
      req.body.disableReason,
    );
    sendSuccess(res, doctor, 'Doctor verification updated');
  });

  createAdmin = asyncHandler(async (req: Request, res: Response) => {
    const admin = await authService.getProfile(req.user!.id, req.user!.userType);
    const newAdmin = await adminService.createAdmin(req.body, admin.name);
    sendSuccess(res, newAdmin, 'Admin created', 201);
  });

  listAdmins = asyncHandler(async (_req: Request, res: Response) => {
    const admins = await adminService.listAdmins();
    sendSuccess(res, admins);
  });

  listPendingDoctors = asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.listPendingDoctors(req.query as Record<string, unknown>);
    sendSuccess(res, result);
  });
}

export const adminController = new AdminController();
