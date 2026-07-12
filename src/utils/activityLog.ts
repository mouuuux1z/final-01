import { prisma } from '../config/database.js';

export async function logActivity(action: string, adminName: string, details?: string): Promise<void> {
  await prisma.activityLog.create({
    data: { action, adminName, details },
  });
}
