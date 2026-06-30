import type { Socket } from 'socket.io';
import { prisma } from '../../config/database.js';
import { verifyToken } from '../../utils/jwt.js';
import type { JwtPayload } from '../../utils/jwt.js';

export interface AuthenticatedSocket extends Socket {
  user?: JwtPayload;
}

export async function socketAuthMiddleware(
  socket: AuthenticatedSocket,
  next: (err?: Error) => void,
): Promise<void> {
  try {
    const token =
      (socket.handshake.auth?.token as string | undefined) ??
      (socket.handshake.headers.authorization?.startsWith('Bearer ')
        ? socket.handshake.headers.authorization.slice(7)
        : undefined);

    if (!token) {
      next(new Error('Authentication required'));
      return;
    }

    const payload = verifyToken(token);
    const session = await prisma.session.findUnique({ where: { token } });

    if (!session || session.expiresAt < new Date()) {
      next(new Error('Invalid session'));
      return;
    }

    socket.user = payload;
    next();
  } catch {
    next(new Error('Authentication failed'));
  }
}
