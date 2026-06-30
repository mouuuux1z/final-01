import type { UserType } from '@prisma/client';
import { getIO } from './io.instance.js';
import { chatRoom, userRoom } from './rooms.js';
import type { SocketEvent } from './events.js';

export function emitToUser(userType: UserType, userId: string, event: SocketEvent, data: unknown): void {
  try {
    getIO().to(userRoom(userType, userId)).emit(event, data);
  } catch {
    // Socket.IO may not be initialized during tests
  }
}

export function emitToChat(doctorId: string, patientId: string, event: SocketEvent, data: unknown): void {
  try {
    getIO().to(chatRoom(doctorId, patientId)).emit(event, data);
  } catch {
    // Socket.IO may not be initialized during tests
  }
}

export function emitToRoom(room: string, event: SocketEvent, data: unknown): void {
  try {
    getIO().to(room).emit(event, data);
  } catch {
    // Socket.IO may not be initialized during tests
  }
}
