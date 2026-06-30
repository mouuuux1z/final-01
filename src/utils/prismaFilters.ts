import type { Prisma } from '@prisma/client';

const isSqlite = process.env.DATABASE_URL?.startsWith('file:');

export function textContains(value: string): Prisma.StringFilter {
  if (isSqlite) {
    return { contains: value };
  }

  return { contains: value, mode: 'insensitive' } as Prisma.StringFilter;
}
