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
    console.error('FATAL: DATABASE_URL is not defined. Set it in backend/.env on the server.');
    process.exit(1);
  }
}

function maskDatabaseHost(databaseUrl: string | undefined): string | null {
  if (!databaseUrl?.trim()) return null;
  try {
    const parsed = new URL(databaseUrl.replace(/^postgresql:\/\//, 'http://'));
    return parsed.host;
  } catch {
    return 'unparseable';
  }
}

async function bootstrap(): Promise<void> {
  ensureDatabaseUrl();

  const port = env.PORT;

  console.log('Environment check:', {
    port,
    nodeEnv: env.NODE_ENV,
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL?.trim()),
    databaseHost: maskDatabaseHost(process.env.DATABASE_URL),
    jwtSecretLength: process.env.JWT_SECRET?.length ?? 0,
  });

  const app = createApp();
  const httpServer = http.createServer(app);
  initSocketIO(httpServer);

  // Listen before DB connect so health checks get a response during startup.
  await new Promise<void>((resolve, reject) => {
    httpServer.listen(port, '0.0.0.0', () => {
      console.log(`MYDoc API listening on 0.0.0.0:${port} [${env.NODE_ENV}]`);
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
