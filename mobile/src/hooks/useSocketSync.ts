import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { connectSocket, disconnectSocket, SocketEvents } from '../services/socket';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useNotificationStore } from '../store/notificationStore';
import type { Appointment, ChatMessage, Notification, PatientUser } from '../types';

export function useSocketSync(): void {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);
  const userType = useAuthStore((s) => s.userType);
  const user = useAuthStore((s) => s.user);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
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

    const onAppointmentNew = () => {
      void queryClient.invalidateQueries({ queryKey: ['appointments'] });
    };

    const onAppointmentUpdated = (_appointment: Appointment) => {
      void queryClient.invalidateQueries({ queryKey: ['appointments'] });
      if (userType === 'PATIENT') {
        void fetchProfile();
      }
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
      void queryClient.invalidateQueries({ queryKey: ['chat'] });
      void queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
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
  }, [isAuthenticated, token, userType, user?.id, addNotification, addMessage, queryClient, fetchProfile, mergePatientProfile]);
}
