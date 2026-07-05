import { io, type Socket } from 'socket.io-client';
import { SOCKET_URL } from '../constants/config';
import type { UserType } from '../types';

export const SocketEvents = {
  APPOINTMENT_NEW: 'appointment:new',
  APPOINTMENT_UPDATED: 'appointment:updated',
  PATIENT_PROFILE_UPDATED: 'patient:profile:updated',
  NOTIFICATION_NEW: 'notification:new',
  CHAT_MESSAGE: 'chat:message',
} as const;

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token: string, userType: UserType, userId: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    socket?.emit('join', { userType, userId });
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
