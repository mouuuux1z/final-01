import { useEffect } from 'react';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { getSocket, SocketEvents } from '../services/socket';
import type { ChatMessage } from '../types';

export interface ChatReadPayload {
  doctorId: string;
  patientId: string;
  readAt: string;
  messageIds: string[];
}

export function useChatSync(doctorId?: string, patientId?: string, queryKey?: QueryKey): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!doctorId || !patientId || !queryKey) return;

    const socket = getSocket();
    if (!socket) return;

    const handleIncoming = (incoming: ChatMessage) => {
      if (incoming.doctorId !== doctorId || incoming.patientId !== patientId) return;
      void queryClient.invalidateQueries({ queryKey });
    };

    const handleRead = (payload: ChatReadPayload) => {
      if (payload.doctorId !== doctorId || payload.patientId !== patientId) return;

      queryClient.setQueryData<ChatMessage[]>(queryKey, (old) => {
        if (!old?.length) return old;
        return old.map((item) =>
          payload.messageIds.includes(item.id) ? { ...item, readAt: payload.readAt } : item,
        );
      });
    };

    socket.on(SocketEvents.CHAT_MESSAGE, handleIncoming);
    socket.on(SocketEvents.CHAT_READ, handleRead);

    return () => {
      socket.off(SocketEvents.CHAT_MESSAGE, handleIncoming);
      socket.off(SocketEvents.CHAT_READ, handleRead);
    };
  }, [doctorId, patientId, queryClient, queryKey]);
}
