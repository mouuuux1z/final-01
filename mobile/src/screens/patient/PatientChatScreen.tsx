import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { AppLoader } from '../../components/AppLoader';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppIcon } from '../../components/AppIcon';
import { ChatComposer } from '../../components/chat/ChatComposer';
import { ChatMessageBubble } from '../../components/chat/ChatMessageBubble';
import { api, getApiErrorMessage } from '../../services/api';
import { sendPatientChatMessage } from '../../services/chatApi';
import { showAlert } from '../../utils/alert';
import { pickChatFile, type PickedFile } from '../../utils/filePicker';
import { markChatAsRead, useChatRoom } from '../../hooks/useChatRoom';
import { useChatSync } from '../../hooks/useChatSync';
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
  const [pendingFile, setPendingFile] = useState<PickedFile | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const chatQueryKey = ['chat', doctorId, patientId] as const;

  useChatRoom(doctorId, patientId);
  useChatSync(doctorId, patientId, chatQueryKey);

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
    queryKey: chatQueryKey,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedResponse<ChatMessage>>>('/chat/messages', {
        params: { doctorId, patientId, limit: 100 },
      });
      return data.data?.items ?? [];
    },
    enabled: Boolean(doctorId && patientId && access?.initiated),
  });

  const sendMutation = useMutation({
    mutationFn: async (payload: { text: string; file?: PickedFile | null }) => {
      await sendPatientChatMessage({
        doctorId,
        patientId,
        message: payload.text,
        file: payload.file,
      });
    },
    onSuccess: () => {
      setMessage('');
      setPendingFile(null);
      void queryClient.invalidateQueries({ queryKey: chatQueryKey });
      void queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    },
    onError: (err) => showAlert(t('common.error'), getApiErrorMessage(err)),
  });

  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if ((!trimmed && !pendingFile) || sendMutation.isPending || !access?.canPatientReply) return;
    sendMutation.mutate({ text: trimmed, file: pendingFile });
  }, [message, pendingFile, sendMutation, access?.canPatientReply]);

  const handleAttach = useCallback(async () => {
    if (sendMutation.isPending || !access?.canPatientReply) return;
    const picked = await pickChatFile();
    if (!picked) return;
    setPendingFile(picked);
  }, [sendMutation.isPending, access?.canPatientReply]);

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
      <View
        className="flex-row items-center bg-primary px-4 pb-5 pt-14"
        style={{
          borderBottomLeftRadius: UI.radius.card,
          borderBottomRightRadius: UI.radius.card,
          overflow: 'hidden',
        }}
      >
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
        <AppLoader className="mt-10" />
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
            renderItem={({ item }) => (
              <ChatMessageBubble
                message={item}
                isOwn={item.senderType === 'PATIENT'}
                formatTime={formatTime}
              />
            )}
          />
        </>
      )}

      {access?.initiated ? (
        <View className="border-t border-slate-200 bg-white px-4 py-3">
          {canReply ? (
            <>
              {pendingFile ? (
                <View className="mb-2 flex-row items-center justify-between rounded-card bg-slate-50 px-3 py-2">
                  <Text className="flex-1 text-sm text-slate-700" numberOfLines={1}>
                    {pendingFile.name}
                  </Text>
                  <Pressable onPress={() => setPendingFile(null)}>
                    <Text className="text-sm font-semibold text-red-500">{t('common.cancel')}</Text>
                  </Pressable>
                </View>
              ) : null}
              <ChatComposer
                value={message}
                onChangeText={setMessage}
                onSend={handleSend}
                onAttach={() => void handleAttach()}
                placeholder={t('chat.messagePlaceholder')}
                sendLabel={t('chat.send')}
                sending={sendMutation.isPending}
                canSend={Boolean(message.trim() || pendingFile)}
              />
            </>
          ) : (
            <Text className="text-center text-sm text-slate-500">{t('chat.inputDisabled')}</Text>
          )}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
