import type { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { uploadDocument, getFileUrl } from '../../middleware/upload.middleware.js';
import { authService } from './auth.service.js';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    const message =
      result.pendingApproval
        ? 'Registration submitted and pending admin approval'
        : 'Registration successful';
    sendSuccess(res, result, message, 201);
  });

  registerDoctor = asyncHandler(async (req: Request, res: Response) => {
    const file = req.file;
    if (!file?.filename) {
      res.status(400).json({ success: false, message: 'Practice license certificate is required' });
      return;
    }
    const certificate = getFileUrl(file.filename);
    const result = await authService.registerDoctor({ ...req.body, certificate });
    sendSuccess(res, result, 'Registration submitted and pending admin approval', 201);
  });

  registerClinic = asyncHandler(async (req: Request, res: Response) => {
    const file = req.file;
    if (!file?.filename) {
      res.status(400).json({ success: false, message: 'Clinic license certificate is required' });
      return;
    }
    const certificate = getFileUrl(file.filename);
    const result = await authService.registerClinic({ ...req.body, certificate });
    sendSuccess(res, result, 'Registration submitted and pending admin approval', 201);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const ipAddress = req.ip ?? req.socket.remoteAddress;
    const result = await authService.login(req.body, ipAddress);
    sendSuccess(res, result, 'Login successful');
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : '';
    if (token) {
      await authService.logout(token);
    }
    sendSuccess(res, null, 'Logged out successfully');
  });

  me = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getProfile(req.user!.id, req.user!.userType);
    sendSuccess(res, user);
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.forgotPassword(req.body.email, req.body.language);
    sendSuccess(res, result, result.message);
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.resetPassword(req.body.email, req.body.code, req.body.password);
    sendSuccess(res, result, result.message);
  });

  deleteAccount = asyncHandler(async (req: Request, res: Response) => {
    const header = req.headers.authorization;
    const sessionToken = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    const result = await authService.deleteAccount(
      req.user!.id,
      req.user!.userType,
      req.body.password,
      sessionToken,
    );
    sendSuccess(res, result, result.message);
  });
}

export const authController = new AuthController();
