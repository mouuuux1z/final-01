import http from 'node:http';
import { env } from './config/env.js';
import {
  connectDatabaseWithRetry,
  disconnectDatabase,
  startDatabaseConnectionLoop,
  startDatabaseKeepAlive,
} from './config/database.js';
import { createApp } from './app.js';
import { initSocketIO } from './websocket/index.js';

function ensureDatabaseUrl(): void {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error(
      'FATAL: DATABASE_URL is not defined. Set DATABASE_URL in Railway Variables before starting the server.',
    );
    process.exit(1);
  }
}

async function bootstrap(): Promise<void> {
  ensureDatabaseUrl();

  const port = Number(process.env.PORT);
  if (!Number.isFinite(port) || port <= 0) {
    console.error(
      'FATAL: PORT is missing. Remove any manual PORT variable from Railway — Railway sets it automatically.',
    );
    process.exit(1);
  }

  console.log('Environment check:', {
    port,
    nodeEnv: env.NODE_ENV,
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL?.trim()),
    jwtSecretLength: process.env.JWT_SECRET?.length ?? 0,
    railwayDomain: process.env.RAILWAY_PUBLIC_DOMAIN ?? null,
  });

  const app = createApp();
  const httpServer = http.createServer(app);
  initSocketIO(httpServer);

  // Listen immediately so Railway proxy gets a response (avoids 502 during DB connect).
  await new Promise<void>((resolve, reject) => {
    httpServer.listen(port, '0.0.0.0', () => {
      console.log(`MYDoc API listening on 0.0.0.0:${port} [${env.NODE_ENV}]`);
      if (process.env.RAILWAY_PUBLIC_DOMAIN) {
        console.log(`Public URL: https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
      }
      resolve();
    });
    httpServer.once('error', reject);
  });

  let stopKeepAlive = () => {};

  void (async () => {
    try {
      await connectDatabaseWithRetry(5, 2000);
      console.log('Database connected');
    } catch (error) {
      console.error('Database not ready at startup, retrying in background:', error);
      startDatabaseConnectionLoop();
    }
    stopKeepAlive = startDatabaseKeepAlive();
  })();

  const shutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down...`);
    stopKeepAlive();
    httpServer.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
