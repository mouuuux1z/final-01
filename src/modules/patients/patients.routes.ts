import { Router } from 'express';
import { UserType } from '@prisma/client';
import { authMiddleware, requireUserTypes } from '../../middleware/auth.middleware.js';
import { adminAuthMiddleware } from '../../middleware/adminAuth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { patientsController } from './patients.controller.js';
import { patientIdParamSchema, updatePatientSchema } from './patients.schema.js';
import { z } from 'zod';
import { EntityStatus } from '@prisma/client';

const updateStatusSchema = z.object({ status: z.nativeEnum(EntityStatus) });

const router = Router();
router.use(authMiddleware, requireUserTypes(UserType.PATIENT));

router.get('/me', patientsController.getMe);
router.patch('/me', validate(updatePatientSchema), patientsController.updateMe);

const adminRouter = Router();
adminRouter.use(...adminAuthMiddleware);
adminRouter.get('/', patientsController.adminList);
adminRouter.get('/:id', validate(patientIdParamSchema, 'params'), patientsController.adminGet);
adminRouter.patch(
  '/:id/status',
  validate(patientIdParamSchema, 'params'),
  validate(updateStatusSchema),
  patientsController.adminUpdateStatus,
);

export { router as patientRoutes, adminRouter as adminPatientRoutes };
