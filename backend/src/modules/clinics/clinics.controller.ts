import type { Request, Response } from 'express';

import { sendSuccess } from '../../utils/apiResponse.js';

import { asyncHandler } from '../../utils/asyncHandler.js';
import { parseIdParam } from '../../utils/params.js';

import { getFileUrl } from '../../middleware/upload.middleware.js';

import { authService } from '../auth/auth.service.js';

import { clinicsService } from './clinics.service.js';



export class ClinicsController {

  getMe = asyncHandler(async (req: Request, res: Response) => {

    const clinic = await clinicsService.getProfile(req.user!.id);

    sendSuccess(res, clinic);

  });



  updateMe = asyncHandler(async (req: Request, res: Response) => {

    const clinic = await clinicsService.updateProfile(req.user!.id, req.body);

    sendSuccess(res, clinic, 'Clinic updated');

  });



  createDoctor = asyncHandler(async (req: Request, res: Response) => {
    const file = req.file;
    if (!file?.filename) {
      res.status(400).json({ success: false, message: 'Practice license certificate is required' });
      return;
    }
    const certificate = getFileUrl(file.filename);
    const doctor = await clinicsService.createDoctor(req.user!.id, { ...req.body, certificate });
    sendSuccess(res, doctor, 'Doctor created', 201);
  });



  assignDoctor = asyncHandler(async (req: Request, res: Response) => {

    const doctor = await clinicsService.assignDoctor(req.user!.id, req.body.doctorId);

    sendSuccess(res, doctor, 'Doctor assigned');

  });



  updateDoctorStatus = asyncHandler(async (req: Request, res: Response) => {

    const doctor = await clinicsService.updateDoctorStatus(

      req.user!.id,

      parseIdParam(req.params.doctorId, 'doctorId'),

      req.body,

    );

    sendSuccess(res, doctor, 'Doctor status updated');

  });



  removeDoctor = asyncHandler(async (req: Request, res: Response) => {

    await clinicsService.removeDoctor(req.user!.id, parseIdParam(req.params.doctorId, 'doctorId'));

    sendSuccess(res, null, 'Doctor removed');

  });

  getDoctorAppointments = asyncHandler(async (req: Request, res: Response) => {
    const result = await clinicsService.getDoctorAppointments(
      req.user!.id,
      parseIdParam(req.params.doctorId, 'doctorId'),
      req.query as Record<string, unknown>,
    );
    sendSuccess(res, result);
  });

  getDoctorAvailability = asyncHandler(async (req: Request, res: Response) => {
    const slots = await clinicsService.getDoctorAvailability(
      req.user!.id,
      parseIdParam(req.params.doctorId, 'doctorId'),
      req.query as Record<string, unknown>,
    );
    sendSuccess(res, slots);
  });

  getDoctorSchedules = asyncHandler(async (req: Request, res: Response) => {
    const schedules = await clinicsService.getDoctorSchedules(req.user!.id, parseIdParam(req.params.doctorId, 'doctorId'));
    sendSuccess(res, schedules);
  });

  generateDoctorRecurringAvailability = asyncHandler(async (req: Request, res: Response) => {
    const result = await clinicsService.generateDoctorRecurringAvailability(
      req.user!.id,
      parseIdParam(req.params.doctorId, 'doctorId'),
      req.body,
    );
    sendSuccess(res, result, 'Slots generated');
  });

  generateDoctorAvailability = asyncHandler(async (req: Request, res: Response) => {
    const result = await clinicsService.generateDoctorAvailability(
      req.user!.id,
      parseIdParam(req.params.doctorId, 'doctorId'),
      req.body,
    );
    sendSuccess(res, result, 'Slots generated');
  });

  createDoctorAvailabilitySlot = asyncHandler(async (req: Request, res: Response) => {
    const slot = await clinicsService.createDoctorAvailabilitySlot(
      req.user!.id,
      parseIdParam(req.params.doctorId, 'doctorId'),
      req.body.date,
      req.body.time,
    );
    sendSuccess(res, slot, 'Slot created', 201);
  });

  deleteDoctorAvailabilitySlot = asyncHandler(async (req: Request, res: Response) => {
    await clinicsService.deleteDoctorAvailabilitySlot(
      req.user!.id,
      parseIdParam(req.params.doctorId, 'doctorId'),
      parseIdParam(req.params.slotId, 'slotId'),
    );
    sendSuccess(res, null, 'Slot deleted');
  });

  manualBookForDoctor = asyncHandler(async (req: Request, res: Response) => {
    const appointment = await clinicsService.manualBookForDoctor(
      req.user!.id,
      parseIdParam(req.params.doctorId, 'doctorId'),
      req.body,
    );
    sendSuccess(res, appointment, 'Manual booking created', 201);
  });

  acceptDoctorAppointment = asyncHandler(async (req: Request, res: Response) => {
    const appointment = await clinicsService.acceptDoctorAppointment(
      req.user!.id,
      parseIdParam(req.params.doctorId, 'doctorId'),
      parseIdParam(req.params.appointmentId, 'appointmentId'),
    );
    sendSuccess(res, appointment, 'Appointment accepted');
  });

  rejectDoctorAppointment = asyncHandler(async (req: Request, res: Response) => {
    const appointment = await clinicsService.rejectDoctorAppointment(
      req.user!.id,
      parseIdParam(req.params.doctorId, 'doctorId'),
      parseIdParam(req.params.appointmentId, 'appointmentId'),
    );
    sendSuccess(res, appointment, 'Appointment rejected');
  });

  markDoctorAppointmentAttendance = asyncHandler(async (req: Request, res: Response) => {
    const appointment = await clinicsService.markDoctorAppointmentAttendance(
      req.user!.id,
      parseIdParam(req.params.doctorId, 'doctorId'),
      parseIdParam(req.params.appointmentId, 'appointmentId'),
      req.body.attendanceStatus,
    );
    sendSuccess(res, appointment, 'Attendance updated');
  });

  getDoctorChatMessages = asyncHandler(async (req: Request, res: Response) => {
    const result = await clinicsService.getDoctorChatMessages(
      req.user!.id,
      parseIdParam(req.params.doctorId, 'doctorId'),
      req.query.patientId as string,
      req.query as Record<string, unknown>,
    );
    sendSuccess(res, result);
  });

  sendDoctorChatMessage = asyncHandler(async (req: Request, res: Response) => {
    const message = await clinicsService.sendDoctorChatMessage(
      req.user!.id,
      parseIdParam(req.params.doctorId, 'doctorId'),
      req.body.patientId,
      req.body.message,
    );
    sendSuccess(res, message, 'Message sent', 201);
  });

  markDoctorChatAsRead = asyncHandler(async (req: Request, res: Response) => {
    const result = await clinicsService.markDoctorChatAsRead(
      req.user!.id,
      parseIdParam(req.params.doctorId, 'doctorId'),
      req.body.patientId,
    );
    sendSuccess(res, result, 'Messages marked as read');
  });

  getDoctorChatConversationReplies = asyncHandler(async (req: Request, res: Response) => {
    const settings = await clinicsService.getDoctorChatConversationReplies(
      req.user!.id,
      parseIdParam(req.params.doctorId, 'doctorId'),
      req.query.patientId as string,
    );
    sendSuccess(res, settings);
  });

  updateDoctorChatConversationReplies = asyncHandler(async (req: Request, res: Response) => {
    const settings = await clinicsService.updateDoctorChatConversationReplies(
      req.user!.id,
      parseIdParam(req.params.doctorId, 'doctorId'),
      req.body.patientId,
      req.body.repliesEnabled,
    );
    sendSuccess(res, settings, 'Conversation replies updated');
  });

  setDoctorOnlineStatus = asyncHandler(async (req: Request, res: Response) => {
    const doctor = await clinicsService.setDoctorOnlineStatus(
      req.user!.id,
      parseIdParam(req.params.doctorId, 'doctorId'),
      req.body.isOnline,
    );
    sendSuccess(res, doctor, 'Doctor online status updated');
  });

  adminList = asyncHandler(async (req: Request, res: Response) => {

    const result = await clinicsService.listAll(req.query as Record<string, unknown>);

    sendSuccess(res, result);

  });



  adminListPending = asyncHandler(async (req: Request, res: Response) => {

    const result = await clinicsService.listPending(req.query as Record<string, unknown>);

    sendSuccess(res, result);

  });



  adminGet = asyncHandler(async (req: Request, res: Response) => {

    const clinic = await clinicsService.getProfile(parseIdParam(req.params.id, 'id'));

    sendSuccess(res, clinic);

  });



  adminUpdate = asyncHandler(async (req: Request, res: Response) => {

    const admin = await authService.getProfile(req.user!.id, req.user!.userType);

    const clinic = await clinicsService.adminUpdate(parseIdParam(req.params.id, 'id'), req.body, admin.name);

    sendSuccess(res, clinic, 'Clinic updated');

  });

}



export const clinicsController = new ClinicsController();

