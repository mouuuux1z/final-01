import { Router } from 'express';

import { UserType } from '@prisma/client';

import { authMiddleware, requireUserTypes } from '../../middleware/auth.middleware.js';

import { adminAuthMiddleware } from '../../middleware/adminAuth.middleware.js';

import { requireActiveClinic } from '../../middleware/requireActiveClinic.middleware.js';

import { validate } from '../../middleware/validate.middleware.js';

import { uploadCertificate } from '../../middleware/upload.middleware.js';

import { clinicsController } from './clinics.controller.js';

import {

  adminUpdateClinicSchema,

  assignDoctorSchema,

  clinicIdParamSchema,

  clinicListQuerySchema,

  createClinicDoctorSchema,

  clinicDoctorStatusSchema,

  updateClinicSchema,

} from './clinics.schema.js';

import { z } from 'zod';
import {
  availabilityQuerySchema,
  createAvailabilitySlotSchema,
  generateAvailabilitySchema,
  generateRecurringAvailabilitySchema,
  slotIdParamSchema,
  onlineStatusSchema,
} from '../doctors/doctors.schema.js';
import {
  doctorManualBookSchema,
  listAppointmentsQuerySchema,
  updateAttendanceSchema,
} from '../appointments/appointments.schema.js';

const doctorIdParamSchema = z.object({ doctorId: z.string().uuid() });
const doctorAppointmentParamSchema = z.object({
  doctorId: z.string().uuid(),
  appointmentId: z.string().uuid(),
});
const doctorSlotParamSchema = z.object({
  doctorId: z.string().uuid(),
  slotId: z.string().uuid(),
});

const clinicChatPatientQuerySchema = z.object({
  patientId: z.string().uuid(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

const clinicChatPatientBodySchema = z.object({
  patientId: z.string().uuid(),
});

const clinicChatSendMessageSchema = z.object({
  patientId: z.string().uuid(),
  message: z.string().min(1).max(5000),
});

const clinicChatRepliesSchema = z.object({
  patientId: z.string().uuid(),
  repliesEnabled: z.boolean(),
});



const router = Router();

router.use(authMiddleware, requireUserTypes(UserType.CLINIC));



router.get('/me', clinicsController.getMe);

router.patch('/me', validate(updateClinicSchema), clinicsController.updateMe);

router.get(
  '/me/doctors/:doctorId/appointments',
  requireActiveClinic,
  validate(doctorIdParamSchema, 'params'),
  validate(listAppointmentsQuerySchema, 'query'),
  clinicsController.getDoctorAppointments,
);
router.get(
  '/me/doctors/:doctorId/availability',
  requireActiveClinic,
  validate(doctorIdParamSchema, 'params'),
  validate(availabilityQuerySchema, 'query'),
  clinicsController.getDoctorAvailability,
);
router.get(
  '/me/doctors/:doctorId/schedules',
  requireActiveClinic,
  validate(doctorIdParamSchema, 'params'),
  clinicsController.getDoctorSchedules,
);
router.post(
  '/me/doctors/:doctorId/availability/generate-recurring',
  requireActiveClinic,
  validate(doctorIdParamSchema, 'params'),
  validate(generateRecurringAvailabilitySchema),
  clinicsController.generateDoctorRecurringAvailability,
);
router.post(
  '/me/doctors/:doctorId/availability/generate',
  requireActiveClinic,
  validate(doctorIdParamSchema, 'params'),
  validate(generateAvailabilitySchema),
  clinicsController.generateDoctorAvailability,
);
router.post(
  '/me/doctors/:doctorId/availability',
  requireActiveClinic,
  validate(doctorIdParamSchema, 'params'),
  validate(createAvailabilitySlotSchema),
  clinicsController.createDoctorAvailabilitySlot,
);
router.delete(
  '/me/doctors/:doctorId/availability/:slotId',
  requireActiveClinic,
  validate(doctorSlotParamSchema, 'params'),
  clinicsController.deleteDoctorAvailabilitySlot,
);
router.post(
  '/me/doctors/:doctorId/appointments/manual',
  requireActiveClinic,
  validate(doctorIdParamSchema, 'params'),
  validate(doctorManualBookSchema),
  clinicsController.manualBookForDoctor,
);
router.post(
  '/me/doctors/:doctorId/appointments/:appointmentId/accept',
  requireActiveClinic,
  validate(doctorAppointmentParamSchema, 'params'),
  clinicsController.acceptDoctorAppointment,
);
router.post(
  '/me/doctors/:doctorId/appointments/:appointmentId/reject',
  requireActiveClinic,
  validate(doctorAppointmentParamSchema, 'params'),
  clinicsController.rejectDoctorAppointment,
);
router.patch(
  '/me/doctors/:doctorId/appointments/:appointmentId/attendance',
  requireActiveClinic,
  validate(doctorAppointmentParamSchema, 'params'),
  validate(updateAttendanceSchema),
  clinicsController.markDoctorAppointmentAttendance,
);
router.get(
  '/me/doctors/:doctorId/chat/messages',
  requireActiveClinic,
  validate(doctorIdParamSchema, 'params'),
  validate(clinicChatPatientQuerySchema, 'query'),
  clinicsController.getDoctorChatMessages,
);
router.post(
  '/me/doctors/:doctorId/chat/messages',
  requireActiveClinic,
  validate(doctorIdParamSchema, 'params'),
  validate(clinicChatSendMessageSchema),
  clinicsController.sendDoctorChatMessage,
);
router.post(
  '/me/doctors/:doctorId/chat/messages/read',
  requireActiveClinic,
  validate(doctorIdParamSchema, 'params'),
  validate(clinicChatPatientBodySchema),
  clinicsController.markDoctorChatAsRead,
);
router.get(
  '/me/doctors/:doctorId/chat/conversations/replies',
  requireActiveClinic,
  validate(doctorIdParamSchema, 'params'),
  validate(clinicChatPatientQuerySchema.pick({ patientId: true }), 'query'),
  clinicsController.getDoctorChatConversationReplies,
);
router.patch(
  '/me/doctors/:doctorId/chat/conversations/replies',
  requireActiveClinic,
  validate(doctorIdParamSchema, 'params'),
  validate(clinicChatRepliesSchema),
  clinicsController.updateDoctorChatConversationReplies,
);

router.post(
  '/me/doctors',
  requireActiveClinic,
  uploadCertificate.single('certificate'),
  validate(createClinicDoctorSchema),
  clinicsController.createDoctor,
);

router.post(

  '/me/doctors/assign',

  requireActiveClinic,

  validate(assignDoctorSchema),

  clinicsController.assignDoctor,

);

router.patch(

  '/me/doctors/:doctorId/status',

  requireActiveClinic,

  validate(doctorIdParamSchema, 'params'),

  validate(clinicDoctorStatusSchema),

  clinicsController.updateDoctorStatus,

);

router.patch(
  '/me/doctors/:doctorId/online',
  requireActiveClinic,
  validate(doctorIdParamSchema, 'params'),
  validate(onlineStatusSchema),
  clinicsController.setDoctorOnlineStatus,
);

router.delete(

  '/me/doctors/:doctorId',

  requireActiveClinic,

  validate(doctorIdParamSchema, 'params'),

  clinicsController.removeDoctor,

);



const adminRouter = Router();

adminRouter.use(...adminAuthMiddleware);

adminRouter.get('/', validate(clinicListQuerySchema, 'query'), clinicsController.adminList);

adminRouter.get('/pending', validate(clinicListQuerySchema, 'query'), clinicsController.adminListPending);

adminRouter.get('/:id', validate(clinicIdParamSchema, 'params'), clinicsController.adminGet);

adminRouter.patch(

  '/:id',

  validate(clinicIdParamSchema, 'params'),

  validate(adminUpdateClinicSchema),

  clinicsController.adminUpdate,

);



export { router as clinicRoutes, adminRouter as adminClinicRoutes };

