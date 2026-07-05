import { create } from 'zustand';
import type { ChatMessage } from '../types';

interface ConversationKey {
  doctorId: string;
  patientId: string;
}

function conversationKey({ doctorId, patientId }: ConversationKey): string {
  return `${doctorId}:${patientId}`;
}

interface ChatState {
  messages: Record<string, ChatMessage[]>;
  unreadCounts: Record<string, number>;
  activeConversation: ConversationKey | null;
  setActiveConversation: (conversation: ConversationKey | null) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (key: string, messages: ChatMessage[]) => void;
  markConversationRead: (key: string) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: {},
  unreadCounts: {},
  activeConversation: null,

  setActiveConversation: (conversation) => set({ activeConversation: conversation }),

  addMessage: (message) =>
    set((state) => {
      const key = conversationKey(message);
      const existing = state.messages[key] ?? [];
      const alreadyExists = existing.some((m) => m.id === message.id);
      if (alreadyExists) return state;

      const isActive =
        state.activeConversation?.doctorId === message.doctorId &&
        state.activeConversation?.patientId === message.patientId;

      return {
        messages: { ...state.messages, [key]: [...existing, message] },
        unreadCounts: isActive
          ? state.unreadCounts
          : { ...state.unreadCounts, [key]: (state.unreadCounts[key] ?? 0) + 1 },
      };
    }),

  setMessages: (key, messages) =>
    set((state) => ({
      messages: { ...state.messages, [key]: messages },
    })),

  markConversationRead: (key) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [key]: 0 },
    })),

  reset: () =>
    set({
      messages: {},
      unreadCounts: {},
      activeConversation: null,
    }),
}));
