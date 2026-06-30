import { Router } from 'express';
import { adminAuthMiddleware } from '../../middleware/adminAuth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { adminController } from './admin.controller.js';
import {
  analyticsQuerySchema,
  complaintIdParamSchema,
  createAdminSchema,
  siteContentSchema,
  updateComplaintSchema,
  userListQuerySchema,
  verifyDoctorSchema,
} from './admin.schema.js';
import { doctorIdParamSchema } from '../doctors/doctors.schema.js';

const router = Router();
router.use(...adminAuthMiddleware);

router.get('/analytics', validate(analyticsQuerySchema, 'query'), adminController.analytics);
router.get('/complaints', adminController.listComplaints);
router.patch(
  '/complaints/:id',
  validate(complaintIdParamSchema, 'params'),
  validate(updateComplaintSchema),
  adminController.updateComplaint,
);
router.get('/site-content', adminController.getSiteContent);
router.put('/site-content', validate(siteContentSchema), adminController.upsertSiteContent);
router.get('/doctors/pending', validate(userListQuerySchema, 'query'), adminController.listPendingDoctors);
router.patch(
  '/doctors/:id/verify',
  validate(doctorIdParamSchema, 'params'),
  validate(verifyDoctorSchema),
  adminController.verifyDoctor,
);
router.get('/admins', adminController.listAdmins);
router.post('/admins', validate(createAdminSchema), adminController.createAdmin);

export default router;
