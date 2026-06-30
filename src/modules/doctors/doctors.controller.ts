import type { Request, Response } from 'express';
import { UserType } from '@prisma/client';
import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { parseIdParam } from '../../utils/params.js';
import { getFileUrl } from '../../middleware/upload.middleware.js';
import { doctorsService } from './doctors.service.js';

export class DoctorsController {
  search = asyncHandler(async (req: Request, res: Response) => {
    const result = await doctorsService.search(req.query as Record<string, unknown>);
    sendSuccess(res, result);
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const doctor = await doctorsService.getProfile(parseIdParam(req.params.id, 'id'));
    sendSuccess(res, doctor);
  });

  getMe = asyncHandler(async (req: Request, res: Response) => {
    const doctor = await doctorsService.getById(req.user!.id);
    sendSuccess(res, doctor);
  });

  updateMe = asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as { image?: Express.Multer.File[]; certificate?: Express.Multer.File[] } | undefined;
    const image = files?.image?.[0]?.filename ? getFileUrl(files.image[0].filename) : undefined;
    const certificate = files?.certificate?.[0]?.filename ? getFileUrl(files.certificate[0].filename) : undefined;
    const doctor = await doctorsService.updateProfile(req.user!.id, req.body, image, certificate);
    sendSuccess(res, doctor, 'Profile updated');
  });

  setOnlineStatus = asyncHandler(async (req: Request, res: Response) => {
    const result = await doctorsService.setOnlineStatus(req.user!.id, req.body.isOnline);
    sendSuccess(res, result, 'Online status updated');
  });

  getSchedules = asyncHandler(async (req: Request, res: Response) => {
    const doctorId = parseIdParam(req.params.id ?? req.user!.id, 'id');
    doctorsService.assertDoctorAccess(req.user!.id, req.user!.userType, doctorId);
    const schedules = await doctorsService.getSchedules(doctorId);
    sendSuccess(res, schedules);
  });

  createSchedule = asyncHandler(async (req: Request, res: Response) => {
    const schedule = await doctorsService.createSchedule(req.user!.id, req.body);
    sendSuccess(res, schedule, 'Schedule created', 201);
  });

  updateSchedule = asyncHandler(async (req: Request, res: Response) => {
    const schedule = await doctorsService.updateSchedule(parseIdParam(req.params.scheduleId, 'scheduleId'), req.user!.id, req.body);
    sendSuccess(res, schedule, 'Schedule updated');
  });

  deleteSchedule = asyncHandler(async (req: Request, res: Response) => {
    await doctorsService.deleteSchedule(parseIdParam(req.params.scheduleId, 'scheduleId'), req.user!.id);
    sendSuccess(res, null, 'Schedule deleted');
  });

  getAvailability = asyncHandler(async (req: Request, res: Response) => {
    const doctorId = parseIdParam(req.params.id, 'id');
    const query = req.query as {
      date?: Date;
      from?: Date;
      to?: Date;
      availableOnly?: boolean | string;
    };
    const slots = await doctorsService.getMyAvailability(doctorId, {
      date: query.date,
      from: query.from,
      to: query.to,
      availableOnly: query.availableOnly === true || query.availableOnly === 'true',
    });
    sendSuccess(res, slots);
  });

  createAvailabilitySlot = asyncHandler(async (req: Request, res: Response) => {
    const slot = await doctorsService.createAvailabilitySlot(req.user!.id, req.body.date, req.body.time);
    sendSuccess(res, slot, 'Slot created', 201);
  });

  bulkCreateAvailability = asyncHandler(async (req: Request, res: Response) => {
    const result = await doctorsService.bulkCreateAvailability(req.user!.id, req.body.date, req.body.times);
    sendSuccess(res, result, 'Slots created', 201);
  });

  generateAvailability = asyncHandler(async (req: Request, res: Response) => {
    const result = await doctorsService.generateAvailability(req.user!.id, req.body);
    sendSuccess(res, result, 'Availability slots generated', 201);
  });

  generateRecurringAvailability = asyncHandler(async (req: Request, res: Response) => {
    const result = await doctorsService.generateRecurringAvailability(req.user!.id, req.body);
    sendSuccess(res, result, 'Recurring availability slots generated', 201);
  });

  getMyAvailability = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as {
      date?: Date;
      from?: Date;
      to?: Date;
      availableOnly?: boolean | string;
    };
    const slots = await doctorsService.getMyAvailability(req.user!.id, {
      date: query.date,
      from: query.from,
      to: query.to,
      availableOnly: query.availableOnly === true || query.availableOnly === 'true',
    });
    sendSuccess(res, slots);
  });

  deleteAvailabilitySlot = asyncHandler(async (req: Request, res: Response) => {
    await doctorsService.deleteAvailabilitySlot(parseIdParam(req.params.slotId, 'slotId'), req.user!.id);
    sendSuccess(res, null, 'Slot deleted');
  });

  adminList = asyncHandler(async (req: Request, res: Response) => {
    const result = await doctorsService.adminSearch(req.query as Record<string, unknown>);
    sendSuccess(res, result);
  });

  adminUpdate = asyncHandler(async (req: Request, res: Response) => {
    const doctor = await doctorsService.adminUpdate(parseIdParam(req.params.id, 'id'), req.body);
    sendSuccess(res, doctor, 'Doctor updated');
  });

  adminDelete = asyncHandler(async (req: Request, res: Response) => {
    await doctorsService.deleteDoctor(parseIdParam(req.params.id, 'id'));
    sendSuccess(res, null, 'Doctor deleted');
  });
}

export const doctorsController = new DoctorsController();
