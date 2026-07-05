import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
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

  const { data: conversations, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['chat-conversations', patientId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedResponse<ConversationItem>>>('/chat/conversations');
      return data.data.items;
    },
    enabled: Boolean(patientId),
  });

  return (
    <ScreenShell scroll={false}>
      <Text className="mb-1 text-2xl font-bold" style={{ color: UI.text.primary }}>{t('chat.messages')}</Text>
      <Text className="mb-5 text-sm" style={{ color: UI.text.secondary }}>{t('chat.patientMessagesHint')}</Text>

      {isLoading ? (
        <ActivityIndicator className="mt-10" color={UI.primary} />
      ) : (
        <FlatList
          data={conversations ?? []}
          keyExtractor={(item) => `${item.doctorId}-${item.patientId}`}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-6"
          ListEmptyComponent={
            <View className="mt-16 items-center px-4">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: UI.primaryLight }}>
                <AppIcon name="messages" size={28} color={UI.primary} strokeWidth={2} />
              </View>
              <Text className="text-center text-base font-semibold" style={{ color: UI.text.primary }}>{t('chat.noConversations')}</Text>
              <Text className="mt-2 text-center text-sm" style={{ color: UI.text.muted }}>{t('chat.patientCannotStart')}</Text>
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
                <Text className="text-base font-semibold" style={{ color: UI.text.primary }}>{item.doctor?.name ?? t('chat.doctor')}</Text>
                <Text className="text-sm" style={{ color: UI.primary }}>{item.doctor?.specialization}</Text>
                <Text className="mt-0.5 text-sm" style={{ color: UI.text.muted }} numberOfLines={1}>{item.message}</Text>
              </View>
              <AppIcon name="messages" size={16} color={UI.text.muted} strokeWidth={2} />
            </Pressable>
          )}
        />
      )}
    </ScreenShell>
  );
}
