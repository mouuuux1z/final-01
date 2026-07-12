import { Router } from 'express';
import { UserType } from '@prisma/client';
import { authMiddleware, requireUserTypes } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { appointmentsController } from './appointments.controller.js';
import {
  appointmentIdParamSchema,
  bookAppointmentSchema,
  doctorManualBookSchema,
  listAppointmentsQuerySchema,
  rescheduleAppointmentSchema,
  updateAttendanceSchema,
} from './appointments.schema.js';

const router = Router();
router.use(authMiddleware);

router.get('/', validate(listAppointmentsQuerySchema, 'query'), appointmentsController.list);
router.get('/:id', validate(appointmentIdParamSchema, 'params'), appointmentsController.getById);

router.post(
  '/',
  requireUserTypes(UserType.PATIENT),
  validate(bookAppointmentSchema),
  appointmentsController.book,
);

router.post(
  '/manual',
  requireUserTypes(UserType.DOCTOR),
  validate(doctorManualBookSchema),
  appointmentsController.doctorManualBook,
);

router.post(
  '/:id/cancel',
  requireUserTypes(UserType.PATIENT, UserType.DOCTOR),
  validate(appointmentIdParamSchema, 'params'),
  appointmentsController.cancel,
);

router.patch(
  '/:id/reschedule',
  requireUserTypes(UserType.PATIENT),
  validate(appointmentIdParamSchema, 'params'),
  validate(rescheduleAppointmentSchema),
  appointmentsController.reschedule,
);

router.post(
  '/:id/accept',
  requireUserTypes(UserType.DOCTOR),
  validate(appointmentIdParamSchema, 'params'),
  appointmentsController.accept,
);

router.post(
  '/:id/reject',
  requireUserTypes(UserType.DOCTOR),
  validate(appointmentIdParamSchema, 'params'),
  appointmentsController.reject,
);

router.patch(
  '/:id/attendance',
  requireUserTypes(UserType.DOCTOR),
  validate(appointmentIdParamSchema, 'params'),
  validate(updateAttendanceSchema),
  appointmentsController.markAttendance,
);

export default router;
