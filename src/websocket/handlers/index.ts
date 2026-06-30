import type { Server as SocketIOServer } from 'socket.io';
import type { AuthenticatedSocket } from '../middleware/auth.middleware.js';
import { handleConnection } from './connection.handler.js';
import { registerChatHandlers } from './chat.handler.js';

export function registerSocketHandlers(io: SocketIOServer): void {
  io.on('connection', (socket) => {
    const authSocket = socket as AuthenticatedSocket;
    handleConnection(authSocket);
    registerChatHandlers(authSocket);
  });
}
