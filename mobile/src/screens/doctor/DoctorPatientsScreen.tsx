import { FlatList, Pressable, Text, View } from 'react-native';
import { AppLoader } from '../../components/AppLoader';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Card } from '../../components/Card';
import { AppIcon } from '../../components/AppIcon';
import { api } from '../../services/api';
import type { ApiResponse, Appointment, PaginatedResponse } from '../../types';
import type { DoctorTabParamList } from '../../navigation/DoctorTabs';
import type { DoctorRootStackParamList } from '../../navigation/DoctorRootStack';
import { UI } from '../../theme/ui';

type Props = BottomTabScreenProps<DoctorTabParamList, 'Patients'>;

export function DoctorPatientsScreen(_props: Props) {
  const { t } = useTranslation();
  const rootNavigation = useNavigation<NativeStackNavigationProp<DoctorRootStackParamList>>();

  const { data: patients, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['doctor-patients'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedResponse<Appointment>>>('/appointments', {
        params: { limit: 50, page: 1 },
      });
      const seen = new Map<string, NonNullable<Appointment['patient']>>();
      for (const apt of data.data?.items ?? []) {
        if (apt.patient && !seen.has(apt.patient.id)) {
          seen.set(apt.patient.id, apt.patient);
        }
      }
      return Array.from(seen.values());
    },
    staleTime: 60_000,
    retry: 1,
  });

  return (
    <View className="flex-1 pt-14">
      <View className="px-6">
        <Text className="mb-6 text-3xl font-bold text-on-sky">{t('doctor.patients')}</Text>
      </View>

      {isLoading ? (
        <View className="mt-10 items-center">
          <AppLoader color={UI.primary} />
          <Text className="mt-3 text-sm text-on-sky-muted">{t('common.loading')}</Text>
        </View>
      ) : isError ? (
        <View className="mt-10 items-center px-6">
          <Text className="mb-3 text-on-sky-muted">{t('common.error')}</Text>
          <Pressable onPress={() => void refetch()} className="rounded-pill px-4 py-2" style={{ backgroundColor: UI.primary }}>
            <Text className="text-sm font-semibold text-white">{t('common.retry')}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={patients ?? []}
          keyExtractor={(item) => item.id}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          contentContainerClassName="px-6 pb-10"
          ListEmptyComponent={
            <View className="mt-10 items-center">
              <Text className="text-on-sky-muted">{t('doctor.noPatients')}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Card className="mb-3">
              <View className="flex-row items-center">
                <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-primary-light">
                  <AppIcon name="profile" size={22} color={UI.primary} strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-slate-900">{item.name}</Text>
                  <Text className="text-sm text-slate-500">{item.phone}</Text>
                </View>
                <Pressable
                  onPress={() =>
                    rootNavigation.navigate('Chat', { patientId: item.id, patientName: item.name })
                  }
                  className="rounded-btn bg-primary px-3 py-2"
                >
                  <Text className="text-xs font-semibold text-white">{t('chat.message')}</Text>
                </Pressable>
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}
