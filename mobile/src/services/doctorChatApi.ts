import { api } from './api';
import type { ChatMessage, PaginatedResponse } from '../types';
import type { ApiResponse } from '../types';

export type DoctorChatMode = 'doctor' | 'clinic';

export interface DoctorChatApi {
  doctorId: string;
  getMessages: (patientId: string) => Promise<ChatMessage[]>;
  sendMessage: (patientId: string, message: string) => Promise<void>;
  markAsRead: (patientId: string) => Promise<void>;
  getConversationReplies: (patientId: string) => Promise<{ repliesEnabled: boolean }>;
  updateConversationReplies: (patientId: string, repliesEnabled: boolean) => Promise<void>;
}

function clinicChatBase(doctorId: string): string {
  return `/clinics/me/doctors/${doctorId}/chat`;
}

export function createDoctorChatApi(mode: DoctorChatMode, doctorId: string): DoctorChatApi {
  if (mode === 'clinic') {
    const base = clinicChatBase(doctorId);
    return {
      doctorId,
      getMessages: async (patientId) => {
        const { data } = await api.get<ApiResponse<PaginatedResponse<ChatMessage>>>(`${base}/messages`, {
          params: { patientId, limit: 100 },
        });
        return data.data.items;
      },
      sendMessage: async (patientId, message) => {
        await api.post(`${base}/messages`, { patientId, message });
      },
      markAsRead: async (patientId) => {
        await api.post(`${base}/messages/read`, { patientId });
      },
      getConversationReplies: async (patientId) => {
        const { data } = await api.get<ApiResponse<{ repliesEnabled: boolean }>>(
          `${base}/conversations/replies`,
          { params: { patientId } },
        );
        return data.data;
      },
      updateConversationReplies: async (patientId, repliesEnabled) => {
        await api.patch(`${base}/conversations/replies`, { patientId, repliesEnabled });
      },
    };
  }

  return {
    doctorId,
    getMessages: async (patientId) => {
      const { data } = await api.get<ApiResponse<PaginatedResponse<ChatMessage>>>('/chat/messages', {
        params: { doctorId, patientId, limit: 100 },
      });
      return data.data.items;
    },
    sendMessage: async (patientId, message) => {
      await api.post('/chat/messages', { doctorId, patientId, message });
    },
    markAsRead: async (patientId) => {
      await api.post('/chat/messages/read', { doctorId, patientId });
    },
    getConversationReplies: async (patientId) => {
      const { data } = await api.get<ApiResponse<{ repliesEnabled: boolean }>>('/chat/conversations/replies', {
        params: { doctorId, patientId },
      });
      return data.data;
    },
    updateConversationReplies: async (patientId, repliesEnabled) => {
      await api.patch('/chat/conversations/replies', { doctorId, patientId, repliesEnabled });
    },
  };
}
