import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { ConversationReplyToggle } from '../../components/doctor/ConversationReplyToggle';
import { ChatComposer } from '../../components/chat/ChatComposer';
import { ChatMessageBubble } from '../../components/chat/ChatMessageBubble';
import { getApiErrorMessage } from '../../services/api';
import { sendDoctorChatMessage } from '../../services/chatApi';
import { createDoctorChatApi, type DoctorChatMode } from '../../services/doctorChatApi';
import { showAlert } from '../../utils/alert';
import { pickChatFile, type PickedFile } from '../../utils/filePicker';
import { useChatRoom } from '../../hooks/useChatRoom';
import { useChatSync } from '../../hooks/useChatSync';
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

  const chatQueryKey = useMemo(
    () => ['chat', mode, doctorId, patientId] as const,
    [mode, doctorId, patientId],
  );

  const [message, setMessage] = useState('');
  const [pendingFile, setPendingFile] = useState<PickedFile | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useChatRoom(doctorId, hasPatient ? patientId : undefined);
  useChatSync(doctorId, hasPatient ? patientId : undefined, chatQueryKey);

  const { data: messages, isLoading, isError, refetch } = useQuery({
    queryKey: chatQueryKey,
    queryFn: () => chatApi!.getMessages(patientId),
    enabled: Boolean(chatApi) && hasPatient,
    retry: 1,
  });

  const sendMutation = useMutation({
    mutationFn: async (payload: { text: string; file?: PickedFile | null }) => {
      const path =
        mode === 'clinic'
          ? `/clinics/me/doctors/${doctorId}/chat/messages`
          : '/chat/messages';

      await sendDoctorChatMessage({
        path,
        doctorId: mode === 'doctor' ? doctorId : undefined,
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
    onError: (error) => showAlert(t('common.error'), getApiErrorMessage(error)),
  });

  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if ((!trimmed && !pendingFile) || sendMutation.isPending) return;
    sendMutation.mutate({ text: trimmed, file: pendingFile });
  }, [message, pendingFile, sendMutation]);

  const handleAttach = useCallback(async () => {
    if (sendMutation.isPending) return;
    const picked = await pickChatFile();
    if (!picked) return;
    setPendingFile(picked);
  }, [sendMutation.isPending]);

  useEffect(() => {
    if (messages?.length && chatApi && hasPatient) {
      listRef.current?.scrollToEnd({ animated: true });
      void chatApi.markAsRead(patientId);
    }
  }, [messages?.length, chatApi, patientId, hasPatient]);

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
        <AppLoader />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View
        className="bg-primary px-4 pb-5 pt-14"
        style={{
          borderBottomLeftRadius: UI.radius.card,
          borderBottomRightRadius: UI.radius.card,
          overflow: 'hidden',
        }}
      >
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
        <AppLoader className="mt-10" />
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
          renderItem={({ item }) => (
            <ChatMessageBubble
              message={item}
              isOwn={item.senderType === 'DOCTOR'}
              formatTime={formatTime}
            />
          )}
          ListEmptyComponent={
            <View className="mt-16 items-center px-6">
              <Text className="text-center text-slate-500">{t('chat.startConversationHint')}</Text>
            </View>
          }
        />
      )}

      <View className="border-t border-slate-200 bg-white px-4 py-3">
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
      </View>
    </KeyboardAvoidingView>
  );
}
