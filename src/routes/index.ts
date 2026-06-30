import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import {
  publicDoctorRoutes,
  doctorRouter,
  adminDoctorRoutes,
} from '../modules/doctors/doctors.routes.js';
import { patientRoutes, adminPatientRoutes } from '../modules/patients/patients.routes.js';
import appointmentRoutes from '../modules/appointments/appointments.routes.js';
import { clinicRoutes, adminClinicRoutes } from '../modules/clinics/clinics.routes.js';
import adminRoutes from '../modules/admin/admin.routes.js';
import chatRoutes from '../modules/chat/chat.routes.js';
import notificationRoutes from '../modules/notifications/notifications.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/doctors', publicDoctorRoutes);
router.use('/doctor', doctorRouter);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/clinics', clinicRoutes);
router.use('/chat', chatRoutes);
router.use('/notifications', notificationRoutes);

router.use('/admin', adminRoutes);
router.use('/admin/doctors', adminDoctorRoutes);
router.use('/admin/patients', adminPatientRoutes);
router.use('/admin/clinics', adminClinicRoutes);

export default router;
