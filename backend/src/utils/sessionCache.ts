import type { UserType } from '@prisma/client';

const TTL_MS = 90_000;
const MAX_ENTRIES = 500;

export type CachedSession = {
  id: string;
  userId: string;
  userType: UserType;
  expiresAt: Date;
};

type CacheEntry = {
  session: CachedSession;
  cachedAt: number;
};

const cache = new Map<string, CacheEntry>();

function pruneIfNeeded(): void {
  if (cache.size <= MAX_ENTRIES) return;
  const oldest = [...cache.entries()].sort((a, b) => a[1].cachedAt - b[1].cachedAt);
  for (let i = 0; i < oldest.length - MAX_ENTRIES; i++) {
    cache.delete(oldest[i][0]);
  }
}

export function getCachedSession(token: string): CachedSession | null {
  const entry = cache.get(token);
  if (!entry) return null;

  if (Date.now() - entry.cachedAt > TTL_MS) {
    cache.delete(token);
    return null;
  }

  if (entry.session.expiresAt < new Date()) {
    cache.delete(token);
    return null;
  }

  return entry.session;
}

export function setCachedSession(token: string, session: CachedSession): void {
  cache.set(token, { session, cachedAt: Date.now() });
  pruneIfNeeded();
}

export function invalidateCachedSession(token: string): void {
  cache.delete(token);
}
