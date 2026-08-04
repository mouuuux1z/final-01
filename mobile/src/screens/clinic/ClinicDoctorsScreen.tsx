import { FlatList, Pressable, Text, View } from 'react-native';
import { AppLoader } from '../../components/AppLoader';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppIcon } from '../../components/AppIcon';
import { Button } from '../../components/Button';
import { api } from '../../services/api';
import type { ApiResponse, ClinicProfile, DoctorUser, EntityStatus } from '../../types';
import type { ClinicStackParamList } from '../../navigation/ClinicStack';
import { UI } from '../../theme/ui';
import type { ClinicTabParamList } from '../../navigation/ClinicTabs';

type Props = CompositeScreenProps<
  BottomTabScreenProps<ClinicTabParamList, 'Doctors'>,
  NativeStackScreenProps<ClinicStackParamList>
>;

const STATUS_LABELS: Record<EntityStatus, string> = {
  ACTIVE: 'clinic.active',
  PENDING: 'common.pending',
  SUSPENDED: 'common.cancelled',
  DISABLED: 'clinic.disabled',
  INACTIVE: 'clinic.disabled',
};

function ClinicDoctorListItem({
  doctor,
  index,
  onPress,
}: {
  doctor: DoctorUser;
  index: number;
  onPress: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Pressable onPress={onPress} className="mb-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm active:opacity-90">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="rounded-full bg-primary-light px-3 py-1">
          <Text className="text-xs font-semibold text-primary">
            {t('clinic.doctorNumber', { number: index + 1 })}
          </Text>
        </View>
        <View className={`rounded-full px-3 py-1 ${doctor.status === 'ACTIVE' ? 'bg-green-50' : 'bg-red-50'}`}>
          <Text className={`text-xs font-semibold ${doctor.status === 'ACTIVE' ? 'text-success' : 'text-error'}`}>
            {t(STATUS_LABELS[doctor.status] as never)}
          </Text>
        </View>
      </View>
      <View className="flex-row items-start">
        <View className="mr-4 h-14 w-14 items-center justify-center rounded-card bg-primary-light">
          <AppIcon name="doctors" size={26} color={UI.primary} strokeWidth={2} />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-slate-900">{doctor.name}</Text>
          <Text className="text-sm text-primary">{doctor.specialization}</Text>
          <Text className="mt-1 text-xs text-slate-500">{doctor.email}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function ClinicDoctorsScreen({ navigation }: Props) {
  const { t } = useTranslation();

  const { data: clinic, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['clinic', 'me'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ClinicProfile>>('/clinics/me');
      return data.data;
    },
    staleTime: 60_000,
    retry: 1,
  });

  const doctors = clinic?.doctors ?? [];

  return (
    <View className="flex-1 pt-14">
      <View className="mb-4 px-6">
        <Text className="text-2xl font-bold text-on-sky">{t('clinic.manageDoctors')}</Text>
        <Text className="mt-1 text-sm text-on-sky-muted">{t('clinic.manageDoctorsHint')}</Text>
      </View>
      <View className="mb-4 px-6">
        <Button title={t('clinic.addDoctor')} onPress={() => navigation.navigate('AddDoctor')} />
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
          data={doctors}
          keyExtractor={(item) => item.id}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 }}
          ListEmptyComponent={
            <View className="mt-16 items-center rounded-card bg-white p-8" style={{ borderColor: UI.border, borderWidth: 1 }}>
              <AppIcon name="doctors" size={40} color="#94A3B8" />
              <Text className="mt-4 text-center text-slate-500">{t('clinic.noDoctors')}</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <ClinicDoctorListItem
              doctor={item}
              index={index}
              onPress={() => navigation.navigate('DoctorDetail', { doctorId: item.id })}
            />
          )}
        />
      )}
    </View>
  );
}
