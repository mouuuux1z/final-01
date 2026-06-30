import type { Request, Response } from 'express';
import { UserType } from '@prisma/client';
import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { parseIdParam } from '../../utils/params.js';
import { appointmentsService } from './appointments.service.js';

export class AppointmentsController {
  book = asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentsService.book(req.user!.id, req.body);
    sendSuccess(res, appointment, 'Appointment booked', 201);
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await appointmentsService.listForUser(
      req.user!.id,
      req.user!.userType,
      req.query as Record<string, unknown>,
    );
    sendSuccess(res, result);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentsService.getById(parseIdParam(req.params.id, 'id'), req.user!.id, req.user!.userType);
    sendSuccess(res, appointment);
  });

  cancel = asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentsService.cancel(parseIdParam(req.params.id, 'id'), req.user!.id, req.user!.userType);
    sendSuccess(res, appointment, 'Appointment cancelled');
  });

  reschedule = asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentsService.reschedule(
      parseIdParam(req.params.id, 'id'),
      req.user!.id,
      req.user!.userType,
      req.body.date,
      req.body.time,
    );
    sendSuccess(res, appointment, 'Appointment rescheduled');
  });

  accept = asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentsService.accept(parseIdParam(req.params.id, 'id'), req.user!.id);
    sendSuccess(res, appointment, 'Appointment accepted');
  });

  reject = asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentsService.reject(parseIdParam(req.params.id, 'id'), req.user!.id);
    sendSuccess(res, appointment, 'Appointment rejected');
  });

  doctorManualBook = asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentsService.doctorManualBook(req.user!.id, req.body);
    sendSuccess(res, appointment, 'Manual booking created', 201);
  });

  markAttendance = asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentsService.markAttendance(
      parseIdParam(req.params.id, 'id'),
      req.user!.id,
      req.body.attendanceStatus,
    );
    sendSuccess(res, appointment, 'Attendance updated');
  });
}

export const appointmentsController = new AppointmentsController();
