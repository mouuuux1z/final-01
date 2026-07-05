import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { UI } from '../../theme/ui';
import { useTypography } from '../../hooks/useTypography';
import { AppIcon, type AppIconName } from '../../components/AppIcon';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { DashboardStatsRow, StatCard } from '../../components/ui/StatCard';
import { changeLanguage, languages } from '../../i18n';
import { api } from '../../services/api';
import { useLogout } from '../../hooks/useLogout';
import { SettingsAboutLink } from '../../components/settings/SettingsAboutLink';
import { useAuthStore } from '../../store/authStore';
import type { AdminUser, ApiResponse } from '../../types';
import type { AdminStackParamList } from '../../navigation/AdminStack';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminDashboard'>;

interface Analytics {
  totals: {
    doctors: number;
    pendingDoctors: number;
    pendingClinics: number;
    patients: number;
    appointments: number;
  };
}

export function AdminDashboardScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
  const typography = useTypography();
  const user = useAuthStore((s) => s.user) as AdminUser | null;
  const { handleLogout } = useLogout();

  const { data: analytics } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Analytics>>('/admin/analytics');
      return data.data;
    },
  });

  const modules: { key: string; label: string; icon: AppIconName; route: keyof AdminStackParamList; badge?: number }[] = [
    { key: 'pending-doctors', label: t('admin.pendingDoctors'), icon: 'pending', route: 'PendingDoctors', badge: analytics?.totals.pendingDoctors },
    { key: 'pending-clinics', label: t('admin.pendingClinics'), icon: 'clinic', route: 'PendingClinics', badge: analytics?.totals.pendingClinics },
    { key: 'doctors', label: t('admin.allDoctors'), icon: 'doctors', route: 'AllDoctors', badge: analytics?.totals.doctors },
  ];

  return (
    <ScrollView className="flex-1" contentContainerClassName="pb-10">
      <View className="px-6 pb-10 pt-16" style={{ backgroundColor: UI.primary }}>
        <Text className="text-sm text-white/80">{t('admin.welcome')}</Text>
        <Text
          className="mt-1 text-3xl text-white"
          style={{ fontFamily: typography.fontFamily, fontWeight: typography.headingWeight }}
        >
          {user?.name ?? t('admin.dashboard')}
        </Text>
        <Text className="mt-1 text-base text-white/80">{user?.role ?? 'ADMIN'}</Text>
      </View>

      <DashboardStatsRow>
        <StatCard
          value={analytics?.totals.pendingDoctors ?? 0}
          label={t('admin.pendingDoctors')}
          icon="pending"
        />
        <StatCard
          value={analytics?.totals.doctors ?? 0}
          label={t('admin.totalDoctors')}
          icon="doctors"
        />
        <StatCard
          value={analytics?.totals.patients ?? 0}
          label={t('admin.patients')}
          icon="patients"
        />
      </DashboardStatsRow>

      <View className="mt-8 px-6">
        <Text
          className="mb-4 text-lg text-heading"
          style={{ fontFamily: typography.fontFamily, fontWeight: typography.headingWeight }}
        >
          {t('admin.management')}
        </Text>
        <View className="gap-3">
          {modules.map((mod) => (
            <Pressable
              key={mod.key}
              onPress={() => navigation.navigate(mod.route)}
              className="flex-row items-center rounded-3xl border border-slate-100 bg-white p-5 shadow-sm active:opacity-90"
            >
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-card bg-primary-light">
                <AppIcon name={mod.icon} size={24} color={UI.primary} strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-slate-900">{mod.label}</Text>
                {mod.badge !== undefined ? (
                  <Text className="mt-0.5 text-sm text-slate-500">{mod.badge} {t('admin.records')}</Text>
                ) : null}
              </View>
              <AppIcon name="menu" size={18} color="#94A3B8" />
            </Pressable>
          ))}
        </View>

        <View className="mt-8">
          <SettingsAboutLink onPress={() => navigation.navigate('About')} />

          <Card className="mb-4 mt-4" title={t('common.language')}>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {languages.map((lang) => (
                <Pressable
                  key={lang.code}
                  onPress={() => void changeLanguage(lang.code)}
                  className={`rounded-full px-4 py-2 ${i18n.language === lang.code ? 'bg-primary' : 'bg-slate-100'}`}
                >
                  <Text className={i18n.language === lang.code ? 'text-white' : 'text-slate-700'}>
                    {lang.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
          <Button title={t('common.logout')} variant="outline" onPress={() => void handleLogout()} />
        </View>
      </View>
    </ScrollView>
  );
}
