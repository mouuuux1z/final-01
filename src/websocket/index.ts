import type { Server as HttpServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from '../config/env.js';
import { setIO } from './io.instance.js';
import { socketAuthMiddleware } from './middleware/auth.middleware.js';
import { registerSocketHandlers } from './handlers/index.js';

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.NODE_ENV === 'production' ? false : '*',
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
  });

  io.use((socket, next) => {
    socketAuthMiddleware(socket as never, next);
  });

  registerSocketHandlers(io);
  setIO(io);

  return io;
}
