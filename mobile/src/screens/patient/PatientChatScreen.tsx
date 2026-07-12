import { useCallback, useEffect, useRef, useState } from 'react';
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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppIcon } from '../../components/AppIcon';
import { api, getApiErrorMessage } from '../../services/api';
import { showAlert } from '../../utils/alert';
import { markChatAsRead, useChatRoom } from '../../hooks/useChatRoom';
import { useAuthStore } from '../../store/authStore';
import type { ApiResponse, ChatAccess, ChatMessage, PaginatedResponse } from '../../types';
import type { PatientStackParamList } from '../../navigation/PatientTabs';
import { UI } from '../../theme/ui';

type Props = NativeStackScreenProps<PatientStackParamList, 'PatientChat'>;

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function PatientChatScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { doctorId, doctorName } = route.params;
  const patientId = useAuthStore((s) => s.user?.id) ?? route.params.patientId;
  const [message, setMessage] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useChatRoom(doctorId, patientId);

  const { data: access, isLoading: accessLoading } = useQuery({
    queryKey: ['chat-access', doctorId, patientId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ChatAccess>>('/chat/access', {
        params: { doctorId, patientId },
      });
      return data.data;
    },
    enabled: Boolean(doctorId && patientId),
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['chat', doctorId, patientId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedResponse<ChatMessage>>>('/chat/messages', {
        params: { doctorId, patientId, limit: 100 },
      });
      return data.data?.items ?? [];
    },
    enabled: Boolean(doctorId && patientId && access?.initiated),
  });

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      await api.post('/chat/messages', { doctorId, patientId, message: text });
    },
    onSuccess: () => {
      setMessage('');
      void queryClient.invalidateQueries({ queryKey: ['chat', doctorId, patientId] });
      void queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    },
    onError: (err) => showAlert(t('common.error'), getApiErrorMessage(err)),
  });

  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed || sendMutation.isPending || !access?.canPatientReply) return;
    sendMutation.mutate(trimmed);
  }, [message, sendMutation, access?.canPatientReply]);

  useEffect(() => {
    if (messages?.length && doctorId && patientId) {
      listRef.current?.scrollToEnd({ animated: true });
      void markChatAsRead(doctorId, patientId);
    }
  }, [messages?.length, doctorId, patientId]);

  const isLoading = accessLoading || (access?.initiated && messagesLoading);
  const canReply = Boolean(access?.canPatientReply);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-row items-center bg-primary px-4 pb-4 pt-14">
        <Pressable onPress={() => navigation.goBack()} className="mr-3">
          <Text className="text-base font-medium text-white">{t('common.back')}</Text>
        </Pressable>
        <View className="flex-1">
          <Text className="text-lg font-bold text-white">{doctorName}</Text>
          <Text className="text-xs text-blue-100">{t('chat.patientChatHint')}</Text>
        </View>
      </View>

      {!accessLoading && !access?.initiated ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <AppIcon name="messages" size={28} color="#94A3B8" strokeWidth={2} />
          </View>
          <Text className="text-center text-base font-semibold text-slate-700">{t('chat.waitingForDoctor')}</Text>
          <Text className="mt-2 text-center text-sm text-slate-500">{t('chat.patientCannotStart')}</Text>
        </View>
      ) : isLoading ? (
        <ActivityIndicator className="mt-10" color={UI.primary} />
      ) : (
        <>
          {!canReply ? (
            <View className="mx-4 mt-4 rounded-card border border-amber-200 bg-amber-50 px-4 py-3">
              <Text className="text-sm text-amber-800">{t('chat.repliesDisabledPatient')}</Text>
            </View>
          ) : null}

          <FlatList
            ref={listRef}
            data={messages ?? []}
            keyExtractor={(item) => item.id}
            contentContainerClassName="px-4 py-4"
            renderItem={({ item }) => {
              const isPatient = item.senderType === 'PATIENT';
              return (
                <View className={`mb-3 max-w-[85%] ${isPatient ? 'self-end' : 'self-start'}`}>
                  <View className={`rounded-card px-4 py-2.5 ${isPatient ? 'bg-primary' : 'bg-white border border-slate-100'}`}>
                    <Text className={`text-sm ${isPatient ? 'text-white' : 'text-slate-800'}`}>{item.message}</Text>
                  </View>
                  <Text className={`mt-1 text-[10px] text-slate-400 ${isPatient ? 'text-right' : 'text-left'}`}>
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
              );
            }}
          />
        </>
      )}

      {access?.initiated ? (
        <View className="border-t border-slate-200 bg-white px-4 py-3">
          {canReply ? (
            <View className="flex-row items-center gap-2">
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
          ) : (
            <Text className="text-center text-sm text-slate-500">{t('chat.inputDisabled')}</Text>
          )}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
