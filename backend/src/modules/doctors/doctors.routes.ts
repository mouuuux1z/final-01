import { Router } from 'express';
import { UserType } from '@prisma/client';
import { authMiddleware, requireUserTypes } from '../../middleware/auth.middleware.js';
import { requireActiveDoctor } from '../../middleware/doctorActive.middleware.js';
import { adminAuthMiddleware } from '../../middleware/adminAuth.middleware.js';
import { uploadDocument, uploadImage } from '../../middleware/upload.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { doctorsController } from './doctors.controller.js';
import {
  availabilityQuerySchema,
  bulkAvailabilitySchema,
  generateAvailabilitySchema,
  generateRecurringAvailabilitySchema,
  createAvailabilitySlotSchema,
  createScheduleSchema,
  doctorIdParamSchema,
  onlineStatusSchema,
  scheduleIdParamSchema,
  searchDoctorsSchema,
  slotIdParamSchema,
  updateDoctorSchema,
  updateScheduleSchema,
  adminUpdateDoctorSchema,
} from './doctors.schema.js';
import { ratingsController } from '../ratings/ratings.controller.js';
import { listRatingsQuerySchema, submitRatingSchema } from '../ratings/ratings.schema.js';

const router = Router();

router.get('/', validate(searchDoctorsSchema, 'query'), doctorsController.search);
router.get(
  '/:id/ratings',
  validate(doctorIdParamSchema, 'params'),
  validate(listRatingsQuerySchema, 'query'),
  ratingsController.listByDoctor,
);
router.get(
  '/:id/ratings/me',
  authMiddleware,
  requireUserTypes(UserType.PATIENT),
  validate(doctorIdParamSchema, 'params'),
  ratingsController.getMyRating,
);
router.post(
  '/:id/ratings',
  authMiddleware,
  requireUserTypes(UserType.PATIENT),
  validate(doctorIdParamSchema, 'params'),
  validate(submitRatingSchema),
  ratingsController.submit,
);
router.get('/:id', validate(doctorIdParamSchema, 'params'), doctorsController.getProfile);
router.get(
  '/:id/availability',
  validate(doctorIdParamSchema, 'params'),
  validate(availabilityQuerySchema, 'query'),
  doctorsController.getAvailability,
);

const doctorRouter = Router();
doctorRouter.use(authMiddleware, requireUserTypes(UserType.DOCTOR), requireActiveDoctor);

doctorRouter.get('/me', doctorsController.getMe);
doctorRouter.patch(
  '/me',
  uploadImage.fields([
    { name: 'image', maxCount: 1 },
    { name: 'certificate', maxCount: 1 },
  ]),
  validate(updateDoctorSchema),
  doctorsController.updateMe,
);
doctorRouter.patch('/me/online', validate(onlineStatusSchema), doctorsController.setOnlineStatus);
doctorRouter.get('/me/schedules', doctorsController.getSchedules);
doctorRouter.post('/me/schedules', validate(createScheduleSchema), doctorsController.createSchedule);
doctorRouter.patch(
  '/me/schedules/:scheduleId',
  validate(scheduleIdParamSchema, 'params'),
  validate(updateScheduleSchema),
  doctorsController.updateSchedule,
);
doctorRouter.delete(
  '/me/schedules/:scheduleId',
  validate(scheduleIdParamSchema, 'params'),
  doctorsController.deleteSchedule,
);
doctorRouter.post('/me/availability', validate(createAvailabilitySlotSchema), doctorsController.createAvailabilitySlot);
doctorRouter.post(
  '/me/availability/generate',
  validate(generateAvailabilitySchema),
  doctorsController.generateAvailability,
);
doctorRouter.post(
  '/me/availability/generate-recurring',
  validate(generateRecurringAvailabilitySchema),
  doctorsController.generateRecurringAvailability,
);
doctorRouter.get(
  '/me/availability',
  validate(availabilityQuerySchema, 'query'),
  doctorsController.getMyAvailability,
);
doctorRouter.post('/me/availability/bulk', validate(bulkAvailabilitySchema), doctorsController.bulkCreateAvailability);
doctorRouter.delete(
  '/me/availability/:slotId',
  validate(slotIdParamSchema, 'params'),
  doctorsController.deleteAvailabilitySlot,
);

const adminRouter = Router();
adminRouter.use(...adminAuthMiddleware);
adminRouter.get('/', validate(searchDoctorsSchema, 'query'), doctorsController.adminList);
adminRouter.patch(
  '/:id',
  validate(doctorIdParamSchema, 'params'),
  validate(adminUpdateDoctorSchema),
  doctorsController.adminUpdate,
);
adminRouter.delete('/:id', validate(doctorIdParamSchema, 'params'), doctorsController.adminDelete);

export { router as publicDoctorRoutes, doctorRouter, adminRouter as adminDoctorRoutes };
