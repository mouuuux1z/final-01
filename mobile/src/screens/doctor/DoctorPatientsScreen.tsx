import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
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

  const { data: patients, isLoading } = useQuery({
    queryKey: ['doctor-patients'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedResponse<Appointment>>>('/appointments', {
        params: { limit: 100 },
      });
      const seen = new Map<string, NonNullable<Appointment['patient']>>();
      for (const apt of data.data.items) {
        if (apt.patient && !seen.has(apt.patient.id)) {
          seen.set(apt.patient.id, apt.patient);
        }
      }
      return Array.from(seen.values());
    },
  });

  return (
    <View className="flex-1 pt-14">
      <View className="px-6">
        <Text className="mb-6 text-3xl font-bold text-slate-900">{t('doctor.patients')}</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-10" color={UI.primary} />
      ) : (
        <FlatList
          data={patients ?? []}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-6 pb-10"
          ListEmptyComponent={
            <View className="mt-10 items-center">
              <Text className="text-slate-500">{t('doctor.noPatients')}</Text>
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
