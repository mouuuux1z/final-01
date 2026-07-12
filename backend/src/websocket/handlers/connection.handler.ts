import type { AuthenticatedSocket } from '../middleware/auth.middleware.js';
import { chatRoom, userRoom } from '../rooms.js';
import { SocketEvents } from '../events.js';

export function handleConnection(socket: AuthenticatedSocket): void {
  const user = socket.user;
  if (!user) return;

  socket.join(userRoom(user.userType as never, user.userId));
  socket.emit(SocketEvents.CONNECTED, { userId: user.userId, userType: user.userType });

  socket.on('disconnect', () => {
    socket.emit(SocketEvents.DISCONNECTED, { userId: user.userId });
  });
}

export function joinChatRoom(socket: AuthenticatedSocket, doctorId: string, patientId: string): void {
  socket.join(chatRoom(doctorId, patientId));
}
