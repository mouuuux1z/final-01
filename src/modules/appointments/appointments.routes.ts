import { Router } from 'express';
import { UserType } from '@prisma/client';
import { authMiddleware, requireUserTypes } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { AppError } from '../../utils/AppError.js';
import { appointmentsController } from './appointments.controller.js';
import { queueController } from '../queue/queue.controller.js';
import {
  appointmentIdParamSchema,
  bookAppointmentSchema,
  createPrivateAppointmentSchema,
  doctorManualBookSchema,
  listAppointmentsQuerySchema,
  rescheduleAppointmentSchema,
  updateAttendanceSchema,
  updatePrivateAppointmentSchema,
} from './appointments.schema.js';

const router = Router();
router.use(authMiddleware);

function requireDoctorPrivateAccess(req: import('express').Request, _res: import('express').Response, next: import('express').NextFunction) {
  if (!req.user || req.user.userType !== UserType.DOCTOR) {
    next(new AppError('ليس لديك صلاحية للوصول إلى المواعيد الخاصة', 403));
    return;
  }
  next();
}

router.get('/', validate(listAppointmentsQuerySchema, 'query'), appointmentsController.list);

router.post(
  '/private',
  requireDoctorPrivateAccess,
  validate(createPrivateAppointmentSchema),
  appointmentsController.createPrivate,
);

router.patch(
  '/private/:id',
  requireDoctorPrivateAccess,
  validate(appointmentIdParamSchema, 'params'),
  validate(updatePrivateAppointmentSchema),
  appointmentsController.updatePrivate,
);

router.delete(
  '/private/:id',
  requireDoctorPrivateAccess,
  validate(appointmentIdParamSchema, 'params'),
  appointmentsController.deletePrivate,
);

router.get('/:id/queue-status', validate(appointmentIdParamSchema, 'params'), queueController.getAppointmentQueueStatus);
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
