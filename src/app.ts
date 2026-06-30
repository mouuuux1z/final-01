import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { uploadConfig } from './config/upload.js';
import { generalRateLimit } from './middleware/rateLimit.middleware.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import apiRoutes from './routes/index.js';

export function createApp() {
  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: env.NODE_ENV === 'development' ? false : undefined,
    }),
  );
  app.use(
    cors({
      origin: env.NODE_ENV === 'development'
        ? (origin, callback) => {
            if (
              !origin ||
              /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(
                origin,
              )
            ) {
              callback(null, true);
              return;
            }
            callback(null, false);
          }
        : true,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(generalRateLimit);

  app.use('/uploads', express.static(uploadConfig.uploadDir));

  app.get('/health', (_req, res) => {
    res.json({ success: true, message: 'MYDoc API is running' });
  });

  app.use('/api', apiRoutes);

  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  app.use(errorHandler);

  return app;
}
