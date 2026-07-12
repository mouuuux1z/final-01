import type { AuthenticatedSocket } from '../middleware/auth.middleware.js';
import { SocketEvents } from '../events.js';
import { chatRoom } from '../rooms.js';

export function registerChatHandlers(socket: AuthenticatedSocket): void {
  socket.on(SocketEvents.CHAT_TYPING, (payload: { doctorId: string; patientId: string }) => {
    if (!payload?.doctorId || !payload?.patientId) return;
    socket.to(chatRoom(payload.doctorId, payload.patientId)).emit(SocketEvents.CHAT_TYPING, {
      userId: socket.user?.userId,
      userType: socket.user?.userType,
    });
  });

  socket.on('chat:join', (payload: { doctorId: string; patientId: string }) => {
    if (!payload?.doctorId || !payload?.patientId) return;
    socket.join(chatRoom(payload.doctorId, payload.patientId));
  });

  socket.on('chat:leave', (payload: { doctorId: string; patientId: string }) => {
    if (!payload?.doctorId || !payload?.patientId) return;
    socket.leave(chatRoom(payload.doctorId, payload.patientId));
  });
}
