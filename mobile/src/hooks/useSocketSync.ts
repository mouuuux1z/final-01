import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { connectSocket, disconnectSocket, SocketEvents } from '../services/socket';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useNotificationStore } from '../store/notificationStore';
import type { Appointment, ChatMessage, Notification, PaginatedResponse, PatientUser } from '../types';

function patchAppointmentCaches(queryClient: ReturnType<typeof useQueryClient>, appointment: Appointment) {
  queryClient.setQueriesData(
    { queryKey: ['appointments'] },
    (old: unknown) => {
      if (!old) return old;

      if (typeof old === 'object' && old !== null && 'items' in old && Array.isArray((old as PaginatedResponse<Appointment>).items)) {
        const paginated = old as PaginatedResponse<Appointment>;
        const exists = paginated.items.some((item) => item.id === appointment.id);
        return {
          ...paginated,
          items: exists
            ? paginated.items.map((item) => (item.id === appointment.id ? appointment : item))
            : [appointment, ...paginated.items],
        };
      }

      if (Array.isArray(old)) {
        const exists = old.some((item) => item.id === appointment.id);
        return exists
          ? old.map((item) => (item.id === appointment.id ? appointment : item))
          : old;
      }

      return old;
    },
  );
}

export function useSocketSync(): void {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);
  const userType = useAuthStore((s) => s.userType);
  const user = useAuthStore((s) => s.user);
  const mergePatientProfile = useAuthStore((s) => s.mergePatientProfile);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const addMessage = useChatStore((s) => s.addMessage);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !token || !userType || !user?.id) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(token, userType, user.id);

    const onAppointmentNew = (appointment: Appointment) => {
      patchAppointmentCaches(queryClient, appointment);
      void queryClient.invalidateQueries({
        queryKey: ['appointments'],
        refetchType: 'active',
      });
    };

    const onAppointmentUpdated = (appointment: Appointment) => {
      patchAppointmentCaches(queryClient, appointment);
    };

    const onPatientProfileUpdated = (profile: PatientUser) => {
      if (userType === 'PATIENT') {
        mergePatientProfile(profile);
      }
    };

    const onNotificationNew = (notification: Notification) => {
      addNotification(notification);
    };

    const onChatMessage = (message: ChatMessage) => {
      addMessage(message);
      void queryClient.invalidateQueries({
        queryKey: ['chat', message.doctorId, message.patientId],
        refetchType: 'active',
      });
      void queryClient.invalidateQueries({
        queryKey: ['chat-conversations'],
        refetchType: 'active',
      });
    };

    socket.on(SocketEvents.APPOINTMENT_NEW, onAppointmentNew);
    socket.on(SocketEvents.APPOINTMENT_UPDATED, onAppointmentUpdated);
    socket.on(SocketEvents.PATIENT_PROFILE_UPDATED, onPatientProfileUpdated);
    socket.on(SocketEvents.NOTIFICATION_NEW, onNotificationNew);
    socket.on(SocketEvents.CHAT_MESSAGE, onChatMessage);

    return () => {
      socket.off(SocketEvents.APPOINTMENT_NEW, onAppointmentNew);
      socket.off(SocketEvents.APPOINTMENT_UPDATED, onAppointmentUpdated);
      socket.off(SocketEvents.PATIENT_PROFILE_UPDATED, onPatientProfileUpdated);
      socket.off(SocketEvents.NOTIFICATION_NEW, onNotificationNew);
      socket.off(SocketEvents.CHAT_MESSAGE, onChatMessage);
      disconnectSocket();
    };
  }, [isAuthenticated, token, userType, user?.id, addNotification, addMessage, queryClient, mergePatientProfile]);
}
