import { config } from 'dotenv';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const backendRoot = path.resolve(__dirname, '../..');
config({ path: path.join(backendRoot, '.env') });

/**
 * Neon / Railway: strip channel_binding=require and enable PgBouncer mode on pooled URLs.
 * Prisma reads DATABASE_URL from the environment when the client is created.
 */
function normalizeDatabaseUrl(url: string, pooled: boolean): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete('channel_binding');

    if (pooled) {
      if (!parsed.searchParams.has('pgbouncer')) {
        parsed.searchParams.set('pgbouncer', 'true');
      }
      if (!parsed.searchParams.has('connection_limit')) {
        parsed.searchParams.set('connection_limit', '5');
      }
    }

    if (!parsed.searchParams.has('sslmode')) {
      parsed.searchParams.set('sslmode', 'require');
    }

    if (!parsed.searchParams.has('connect_timeout')) {
      parsed.searchParams.set('connect_timeout', '15');
    }

    return parsed.toString();
  } catch {
    return url.replace(/[&?]channel_binding=require/g, '');
  }
}

if (process.env.DATABASE_URL) {
  const pooled = process.env.DATABASE_URL.includes('-pooler');
  process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL, pooled);
}

if (!process.env.DIRECT_DATABASE_URL?.trim() && process.env.DATABASE_URL) {
  try {
    const parsed = new URL(process.env.DATABASE_URL);
    parsed.hostname = parsed.hostname.replace('-pooler', '');
    parsed.searchParams.delete('pgbouncer');
    process.env.DIRECT_DATABASE_URL = parsed.toString();
  } catch {
    process.env.DIRECT_DATABASE_URL = process.env.DATABASE_URL.replace('-pooler', '');
  }
}

if (process.env.DIRECT_DATABASE_URL) {
  process.env.DIRECT_DATABASE_URL = normalizeDatabaseUrl(
    process.env.DIRECT_DATABASE_URL,
    false,
  );
}

function isConnectionClosedError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const message = String((error as Error).message ?? error);
  const code = (error as { code?: string }).code;
  return (
    message.includes('Closed') ||
    message.includes('Connection terminated') ||
    message.includes('ECONNRESET') ||
    message.includes('ETIMEDOUT') ||
    message.includes('Server has closed the connection') ||
    message.includes('Timed out fetching a new connection') ||
    code === 'P1001' ||
    code === 'P1017' ||
    code === 'P2024'
  );
}

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  return client.$extends({
    query: {
      async $allOperations({ args, query }) {
        try {
          return await query(args);
        } catch (error) {
          if (!isConnectionClosedError(error)) throw error;

          databaseReady = false;
          await client.$disconnect();
          await client.$connect();
          databaseReady = true;
          return await query(args);
        }
      },
    },
  });
}

type PrismaExtended = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as { prisma: PrismaExtended | undefined };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;

let databaseReady = false;

export function isDatabaseReady(): boolean {
  return databaseReady;
}

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  databaseReady = true;
}

export async function connectDatabaseWithRetry(
  maxAttempts = 10,
  delayMs = 3000,
): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await connectDatabase();
      if (attempt > 1) {
        console.log(`Database connected on attempt ${attempt}`);
      }
      return;
    } catch (error) {
      lastError = error;
      databaseReady = false;
      console.error(`Database connection attempt ${attempt}/${maxAttempts} failed`, error);
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

export function startDatabaseConnectionLoop(
  maxAttempts = 30,
  delayMs = 5000,
): void {
  void (async () => {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        await connectDatabase();
        console.log(`Database connected on attempt ${attempt}`);
        return;
      } catch (error) {
        databaseReady = false;
        console.error(`Database connection attempt ${attempt}/${maxAttempts} failed`, error);
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }
    console.error('Database still unavailable after repeated retries');
  })();
}

export async function disconnectDatabase(): Promise<void> {
  databaseReady = false;
  await prisma.$disconnect();
}

async function pingDatabase(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
  databaseReady = true;
}

async function reconnectDatabase(reason: string): Promise<void> {
  databaseReady = false;
  console.warn(`Database reconnecting (${reason})...`);
  try {
    await prisma.$disconnect();
  } catch {
    // Pool may already be closed.
  }
  await prisma.$connect();
  await pingDatabase();
  console.log('Database reconnected');
}

/** Neon closes idle connections after ~5 min — ping every 45s to keep the pool alive. */
export function startDatabaseKeepAlive(intervalMs = 45 * 1000): () => void {
  const runKeepAlive = () => {
    void (async () => {
      try {
        await pingDatabase();
      } catch (error) {
        console.error('Database keepalive failed', error);
        try {
          await reconnectDatabase('keepalive failure');
        } catch (reconnectError) {
          databaseReady = false;
          console.error('Database reconnect failed', reconnectError);
        }
      }
    })();
  };

  runKeepAlive();
  const timer = setInterval(runKeepAlive, intervalMs);
  timer.unref?.();

  return () => clearInterval(timer);
}
