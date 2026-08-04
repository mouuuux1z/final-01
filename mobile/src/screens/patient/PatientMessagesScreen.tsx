import { FlatList, Pressable, Text, View } from 'react-native';
import { AppLoader } from '../../components/AppLoader';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppIcon } from '../../components/AppIcon';
import { ScreenShell } from '../../components/ui/ScreenShell';
import { UI } from '../../theme/ui';
import { api } from '../../services/api';
import type { ApiResponse, ChatMessage, PaginatedResponse } from '../../types';
import type { PatientStackParamList, PatientTabParamList } from '../../navigation/PatientTabs';
import { useAuthStore } from '../../store/authStore';

type Props = CompositeScreenProps<
  BottomTabScreenProps<PatientTabParamList, 'Messages'>,
  NativeStackScreenProps<PatientStackParamList>
>;

interface ConversationItem extends ChatMessage {
  doctor?: { id: string; name: string; specialization: string };
}

export function PatientMessagesScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const patientId = useAuthStore((s) => s.user?.id);

  const { data: conversations, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['chat-conversations', patientId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedResponse<ConversationItem>>>('/chat/conversations');
      return data.data?.items ?? [];
    },
    enabled: Boolean(patientId),
    staleTime: 60_000,
    retry: 1,
  });

  return (
    <ScreenShell scroll={false}>
      <Text className="mb-1 text-2xl font-bold text-on-sky">{t('chat.messages')}</Text>
      <Text className="mb-5 text-sm text-on-sky-muted">{t('chat.patientMessagesHint')}</Text>

      {isLoading ? (
        <View className="mt-10 items-center">
          <AppLoader color={UI.primary} />
          <Text className="mt-3 text-sm text-on-sky-muted">{t('common.loading')}</Text>
        </View>
      ) : isError ? (
        <View className="mt-10 items-center rounded-card bg-white p-8" style={{ borderColor: UI.border, borderWidth: 1 }}>
          <Text className="mb-3 text-center" style={{ color: UI.text.secondary }}>
            {t('common.error')}
          </Text>
          <Pressable onPress={() => void refetch()} className="rounded-pill px-4 py-2" style={{ backgroundColor: UI.primary }}>
            <Text className="text-sm font-semibold text-white">{t('common.retry')}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={conversations ?? []}
          keyExtractor={(item) => `${item.doctorId}-${item.patientId}`}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
          ListEmptyComponent={
            <View className="mt-10 items-center rounded-card bg-white p-8" style={{ borderColor: UI.border, borderWidth: 1 }}>
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: UI.primaryLight }}>
                <AppIcon name="messages" size={28} color={UI.primary} strokeWidth={2} />
              </View>
              <Text className="text-center text-base font-semibold" style={{ color: UI.text.primary }}>
                {t('chat.noConversations')}
              </Text>
              <Text className="mt-2 text-center text-sm" style={{ color: UI.text.muted }}>
                {t('chat.patientCannotStart')}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate('PatientChat', {
                  doctorId: item.doctorId,
                  patientId: item.patientId,
                  doctorName: item.doctor?.name ?? t('chat.doctor'),
                })
              }
              className="mb-3 flex-row items-center rounded-card border bg-white p-4 active:opacity-90"
              style={{ borderColor: UI.border }}
            >
              <View className="mr-3 h-12 w-12 items-center justify-center rounded-btn" style={{ backgroundColor: UI.primaryLight }}>
                <AppIcon name="doctors" size={22} color={UI.primary} strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold" style={{ color: UI.text.primary }}>
                  {item.doctor?.name ?? t('chat.doctor')}
                </Text>
                <Text className="text-sm" style={{ color: UI.primary }}>{item.doctor?.specialization}</Text>
                <Text className="mt-0.5 text-sm" style={{ color: UI.text.muted }} numberOfLines={1}>
                  {item.message}
                </Text>
              </View>
              <AppIcon name="messages" size={16} color={UI.text.muted} strokeWidth={2} />
            </Pressable>
          )}
        />
      )}
    </ScreenShell>
  );
}
