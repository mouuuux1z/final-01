import { Router } from 'express';
import { isDatabaseReady } from '../config/database.js';

/** Used by clients to detect queue API availability on the server. */
export const API_FEATURES = {
  liveQueue: true,
} as const;

const router = Router();

router.get('/', (_req, res) => {
  const database = isDatabaseReady() ? 'connected' : 'connecting';
  res.status(200).json({
    success: true,
    message: 'MYDoc API is running',
    database,
    features: API_FEATURES,
  });
});

router.get('/queue', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      liveQueue: API_FEATURES.liveQueue,
      routes: {
        doctorToday: '/api/doctor/me/queue/today',
        doctorStart: '/api/doctor/me/queue/start',
        doctorNext: '/api/doctor/me/queue/next',
        appointmentStatus: '/api/appointments/:id/queue-status',
      },
    },
  });
});

export default router;
