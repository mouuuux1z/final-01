import { useEffect } from 'react';
import { api } from '../services/api';
import { getSocket } from '../services/socket';

export function useChatRoom(doctorId?: string, patientId?: string): void {
  useEffect(() => {
    if (!doctorId || !patientId) return;

    const socket = getSocket();
    if (!socket) return;

    const payload = { doctorId, patientId };
    socket.emit('chat:join', payload);

    return () => {
      socket.emit('chat:leave', payload);
    };
  }, [doctorId, patientId]);
}

export async function markChatAsRead(doctorId: string, patientId: string): Promise<void> {
  await api.post('/chat/messages/read', { doctorId, patientId });
}
