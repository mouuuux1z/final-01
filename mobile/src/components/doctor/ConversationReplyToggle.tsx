import { ActivityIndicator, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppIcon } from '../AppIcon';
import type { DoctorChatApi } from '../../services/doctorChatApi';

interface ConversationReplyToggleProps {
  chatApi: DoctorChatApi;
  patientId: string;
  patientName?: string;
}

export function ConversationReplyToggle({ chatApi, patientId, patientName }: ConversationReplyToggleProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { doctorId } = chatApi;

  const { data: settings, isLoading } = useQuery({
    queryKey: ['chat-conversation-replies', doctorId, patientId],
    queryFn: () => chatApi.getConversationReplies(patientId),
    enabled: Boolean(doctorId && patientId),
  });

  const repliesEnabled = settings?.repliesEnabled ?? false;

  const settingsMutation = useMutation({
    mutationFn: (nextEnabled: boolean) => chatApi.updateConversationReplies(patientId, nextEnabled),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['chat-conversation-replies', doctorId, patientId] });
      void queryClient.invalidateQueries({ queryKey: ['chat-access', doctorId, patientId] });
    },
  });

  if (isLoading) {
    return (
      <View className="items-center rounded-card bg-white/15 px-4 py-3">
        <ActivityIndicator color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View className="flex-row items-center justify-between rounded-card border border-white/20 bg-white/15 px-4 py-3">
      <View className="mr-3 flex-1 flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-btn bg-white/20">
          <AppIcon name="messages" size={20} color="#FFFFFF" strokeWidth={2.25} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-white">{t('chat.allowReplies')}</Text>
          <Text className="mt-0.5 text-xs text-blue-100">
            {patientName
              ? t('chat.allowReplyForPatient', { name: patientName })
              : t('chat.perPatientRepliesHint')}
          </Text>
        </View>
      </View>

      {settingsMutation.isPending ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Switch
          value={repliesEnabled}
          onValueChange={(value) => {
            if (!settingsMutation.isPending) {
              settingsMutation.mutate(value);
            }
          }}
          trackColor={{ false: '#64748B', true: '#86EFAC' }}
          thumbColor={repliesEnabled ? '#16A34A' : '#F8FAFC'}
        />
      )}
    </View>
  );
}
