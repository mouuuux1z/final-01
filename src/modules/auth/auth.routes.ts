import { Router } from 'express';
import { authRateLimit } from '../../middleware/rateLimit.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { uploadCertificate } from '../../middleware/upload.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authController } from './auth.controller.js';
import { doctorRegisterMultipartSchema, clinicRegisterMultipartSchema, deleteAccountSchema, forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from './auth.schema.js';

const router = Router();

router.post('/register', authRateLimit, validate(registerSchema), authController.register);
router.post(
  '/register/doctor',
  authRateLimit,
  uploadCertificate.single('certificate'),
  validate(doctorRegisterMultipartSchema),
  authController.registerDoctor,
);
router.post(
  '/register/clinic',
  authRateLimit,
  uploadCertificate.single('certificate'),
  validate(clinicRegisterMultipartSchema),
  authController.registerClinic,
);
router.post('/login', authRateLimit, validate(loginSchema), authController.login);
router.post('/forgot-password', authRateLimit, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authRateLimit, validate(resetPasswordSchema), authController.resetPassword);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);
router.delete('/me', authMiddleware, validate(deleteAccountSchema), authController.deleteAccount);

export default router;
