import http from 'node:http';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { createApp } from './app.js';
import { initSocketIO } from './websocket/index.js';

function ensureDatabaseUrl(): void {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error(
      'FATAL: DATABASE_URL is not defined. Set DATABASE_URL in your environment (e.g. Render dashboard) before starting the server.',
    );
    process.exit(1);
  }
}

async function bootstrap(): Promise<void> {
  ensureDatabaseUrl();
  await connectDatabase();

  const app = createApp();
  const httpServer = http.createServer(app);

  initSocketIO(httpServer);

  httpServer.listen(env.PORT, () => {
    console.log(`MYDoc API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down...`);
    httpServer.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
