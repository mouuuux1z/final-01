import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ConversationReplyToggle } from '../../components/doctor/ConversationReplyToggle';
import { getApiErrorMessage } from '../../services/api';
import { createDoctorChatApi, type DoctorChatMode } from '../../services/doctorChatApi';
import { getSocket, SocketEvents } from '../../services/socket';
import { showAlert } from '../../utils/alert';
import { useChatRoom } from '../../hooks/useChatRoom';
import { useAuthStore } from '../../store/authStore';
import type { ChatMessage } from '../../types';
import { UI } from '../../theme/ui';

export type DoctorChatScreenParams = {
  patientId: string;
  patientName: string;
  doctorId?: string;
  chatMode?: DoctorChatMode;
};

interface DoctorChatScreenProps {
  navigation: { goBack: () => void };
  route: { params?: DoctorChatScreenParams };
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function DoctorChatScreen({ navigation, route }: DoctorChatScreenProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const authDoctorId = useAuthStore((s) => s.user?.id);
  const params = route.params;
  const patientId = params?.patientId ?? '';
  const patientName = params?.patientName ?? '';
  const routeDoctorId = params?.doctorId;
  const chatMode = params?.chatMode;

  const doctorId = routeDoctorId ?? authDoctorId;
  const mode: DoctorChatMode = chatMode ?? (routeDoctorId ? 'clinic' : 'doctor');
  const hasPatient = Boolean(params?.patientId);

  const chatApi = useMemo(() => {
    if (!doctorId || !hasPatient) return null;
    return createDoctorChatApi(mode, doctorId);
  }, [doctorId, mode, hasPatient]);

  const [message, setMessage] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useChatRoom(doctorId, hasPatient ? patientId : undefined);

  const { data: messages, isLoading, isError, refetch } = useQuery({
    queryKey: ['chat', mode, doctorId, patientId],
    queryFn: () => chatApi!.getMessages(patientId),
    enabled: Boolean(chatApi) && hasPatient,
    retry: 1,
  });

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      await chatApi!.sendMessage(patientId, text);
    },
    onSuccess: () => {
      setMessage('');
      void queryClient.invalidateQueries({ queryKey: ['chat', mode, doctorId, patientId] });
      void queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    },
    onError: (error) => showAlert(t('common.error'), getApiErrorMessage(error)),
  });

  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed || sendMutation.isPending) return;
    sendMutation.mutate(trimmed);
  }, [message, sendMutation]);

  useEffect(() => {
    if (messages?.length && chatApi && hasPatient) {
      listRef.current?.scrollToEnd({ animated: true });
      void chatApi.markAsRead(patientId);
    }
  }, [messages?.length, chatApi, patientId, hasPatient]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !doctorId || !hasPatient) return;

    const handleIncoming = (incoming: ChatMessage) => {
      if (incoming.doctorId !== doctorId || incoming.patientId !== patientId) return;
      void queryClient.invalidateQueries({ queryKey: ['chat', mode, doctorId, patientId] });
    };

    socket.on(SocketEvents.CHAT_MESSAGE, handleIncoming);
    return () => {
      socket.off(SocketEvents.CHAT_MESSAGE, handleIncoming);
    };
  }, [doctorId, patientId, mode, queryClient, hasPatient]);

  const hasStarted = (messages?.length ?? 0) > 0;

  if (!hasPatient) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-4 text-center text-on-sky">{t('common.error')}</Text>
        <Pressable onPress={() => navigation.goBack()} className="rounded-pill bg-primary px-5 py-3">
          <Text className="font-semibold text-white">{t('common.back')}</Text>
        </Pressable>
      </View>
    );
  }

  if (!chatApi || !doctorId) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={UI.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="bg-primary px-4 pb-4 pt-14">
        <View className="mb-3 flex-row items-center">
          <Pressable onPress={() => navigation.goBack()} className="mr-3">
            <Text className="text-base font-medium text-white">{t('common.back')}</Text>
          </Pressable>
          <View className="flex-1">
            <Text className="text-lg font-bold text-white">{patientName}</Text>
            <Text className="text-xs text-blue-100">{t('chat.doctorControlsChat')}</Text>
          </View>
        </View>
        <ConversationReplyToggle chatApi={chatApi} patientId={patientId} patientName={patientName} />
      </View>

      {!hasStarted ? (
        <View className="mx-4 mt-4 rounded-card border border-blue-100 bg-primary-light px-4 py-3">
          <Text className="text-sm text-blue-800">{t('chat.startConversationHint')}</Text>
        </View>
      ) : null}

      {isLoading ? (
        <ActivityIndicator className="mt-10" color={UI.primary} />
      ) : isError ? (
        <View className="mt-10 items-center px-6">
          <Text className="mb-3 text-slate-500">{t('common.error')}</Text>
          <Pressable onPress={() => void refetch()} className="rounded-pill px-4 py-2" style={{ backgroundColor: UI.primary }}>
            <Text className="text-sm font-semibold text-white">{t('common.retry')}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          ref={listRef}
          data={messages ?? []}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 py-4"
          renderItem={({ item }) => {
            const isDoctor = item.senderType === 'DOCTOR';
            return (
              <View className={`mb-3 max-w-[85%] ${isDoctor ? 'self-end' : 'self-start'}`}>
                <View
                  className={`rounded-card px-4 py-2.5 ${isDoctor ? 'bg-primary' : 'bg-white border border-slate-100'}`}
                >
                  <Text className={`text-sm ${isDoctor ? 'text-white' : 'text-slate-800'}`}>{item.message}</Text>
                </View>
                <Text className={`mt-1 text-[10px] text-slate-400 ${isDoctor ? 'text-right' : 'text-left'}`}>
                  {formatTime(item.createdAt)}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View className="mt-16 items-center px-6">
              <Text className="text-center text-slate-500">{t('chat.startConversationHint')}</Text>
            </View>
          }
        />
      )}

      <View className="flex-row items-center gap-2 border-t border-slate-200 bg-white px-4 py-3">
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder={t('chat.messagePlaceholder')}
          placeholderTextColor="#94A3B8"
          className="flex-1 rounded-card bg-slate-100 px-4 py-3 text-base text-slate-900"
          multiline
        />
        <Pressable
          onPress={handleSend}
          disabled={sendMutation.isPending || !message.trim()}
          className="rounded-card bg-primary px-4 py-3"
        >
          <Text className="font-semibold text-white">{t('chat.send')}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
