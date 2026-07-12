import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppIcon, type AppIconName } from '../../components/AppIcon';
import { Card } from '../../components/Card';
import { DashboardStatsRow, StatCard } from '../../components/ui/StatCard';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import type { ApiResponse, ClinicProfile, ClinicUser } from '../../types';
import type { ClinicStackParamList } from '../../navigation/ClinicStack';
import { UI } from '../../theme/ui';
import type { ClinicTabParamList } from '../../navigation/ClinicTabs';

type Props = CompositeScreenProps<
  BottomTabScreenProps<ClinicTabParamList, 'Dashboard'>,
  NativeStackScreenProps<ClinicStackParamList>
>;

export function ClinicDashboardScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user) as ClinicUser | null;

  const { data: clinic, isLoading, isError, refetch } = useQuery({
    queryKey: ['clinic', 'me'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ClinicProfile>>('/clinics/me');
      return data.data;
    },
    staleTime: 60_000,
    retry: 1,
  });

  const doctors = clinic?.doctors ?? [];
  const activeDoctors = doctors.filter((doctor) => doctor.status === 'ACTIVE').length;
  const disabledDoctors = doctors.filter((doctor) => doctor.status === 'DISABLED').length;

  const stats: { label: string; value: string; icon: AppIconName }[] = [
    { label: t('clinic.totalDoctors'), value: String(doctors.length), icon: 'doctors' },
    { label: t('clinic.activeDoctors'), value: String(activeDoctors), icon: 'pending' },
    { label: t('clinic.disabledDoctors'), value: String(disabledDoctors), icon: 'settings' },
  ];

  return (
    <ScrollView className="flex-1" contentContainerClassName="pb-10">
      <View
        className="mx-4 mt-3 bg-primary px-6 pb-8 pt-14"
        style={{
          borderRadius: UI.radius.card,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.25)',
          overflow: 'hidden',
        }}
      >
        <Text className="text-sm text-blue-100">{t('clinic.dashboard')}</Text>
        <Text className="mt-1 text-3xl font-bold text-white">
          {t('clinic.welcome', { name: user?.name ?? clinic?.name ?? '' })}
        </Text>
        <Text className="mt-1 text-sm text-blue-100">{t('clinic.manager')}</Text>
      </View>

      {isLoading ? (
        <View className="mt-10 items-center">
          <ActivityIndicator color={UI.primary} />
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
        <>
          <DashboardStatsRow>
            {stats.map((stat) => (
              <StatCard key={stat.label} value={stat.value} label={stat.label} icon={stat.icon} />
            ))}
          </DashboardStatsRow>

          <View className="mt-8 px-6">
            <Card className="mb-4" title={t('clinic.clinicInfo')}>
              <View className="mt-3 gap-3">
                <View className="flex-row justify-between">
                  <Text className="text-slate-500">{t('clinic.location')}</Text>
                  <Text className="font-medium text-slate-900">{clinic?.location ?? user?.location ?? '—'}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-slate-500">{t('auth.phone')}</Text>
                  <Text className="font-medium text-slate-900">{clinic?.phone ?? user?.phone ?? '—'}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-slate-500">{t('clinic.status')}</Text>
                  <Text className="font-medium text-primary">{clinic?.status ?? user?.status ?? 'PENDING'}</Text>
                </View>
              </View>
            </Card>

            <Pressable
              onPress={() => navigation.navigate('Doctors')}
              className="mb-4 flex-row items-center rounded-3xl border border-slate-100 bg-white p-5 shadow-sm active:opacity-90"
            >
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-card bg-primary-light">
                <AppIcon name="doctors" size={24} color={UI.primary} strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-slate-900">{t('clinic.manageDoctors')}</Text>
                <Text className="mt-0.5 text-sm text-slate-500">{t('clinic.manageDoctorsHint')}</Text>
              </View>
              <AppIcon name="menu" size={18} color="#94A3B8" />
            </Pressable>

            {doctors.length > 0 ? (
              <Card title={t('clinic.ourDoctors')} subtitle={`${doctors.length} ${t('clinic.doctors')}`}>
                <View className="mt-3 gap-2">
                  {doctors.slice(0, 3).map((doctor, index) => (
                    <Pressable
                      key={doctor.id}
                      onPress={() => navigation.navigate('DoctorDetail', { doctorId: doctor.id })}
                      className="flex-row items-center rounded-card bg-slate-50 px-4 py-3 active:opacity-80"
                    >
                      <View className="mr-3 h-10 w-10 items-center justify-center rounded-btn bg-primary-light">
                        <Text className="text-sm font-bold text-primary">{index + 1}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-semibold text-slate-900">{doctor.name}</Text>
                        <Text className="text-xs text-slate-500">{doctor.specialization}</Text>
                      </View>
                      <AppIcon name="menu" size={16} color="#94A3B8" />
                    </Pressable>
                  ))}
                </View>
              </Card>
            ) : (
              <Card title={t('clinic.noDoctors')} subtitle={t('clinic.addDoctorHint')}>
                <Pressable
                  onPress={() => navigation.navigate('AddDoctor')}
                  className="mt-4 rounded-card bg-primary py-3 active:opacity-90"
                >
                  <Text className="text-center font-semibold text-white">{t('clinic.addDoctor')}</Text>
                </Pressable>
              </Card>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}
