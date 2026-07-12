import { Pressable, ScrollView, Text, View } from 'react-native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { changeLanguage, languages } from '../../i18n';
import { useLogout } from '../../hooks/useLogout';
import { SettingsAboutLink } from '../../components/settings/SettingsAboutLink';
import { useAuthStore } from '../../store/authStore';
import type { ClinicUser } from '../../types';
import type { ClinicTabParamList } from '../../navigation/ClinicTabs';
import type { ClinicStackParamList } from '../../navigation/ClinicStack';

type Props = BottomTabScreenProps<ClinicTabParamList, 'Settings'>;
type SettingsNavigation = CompositeNavigationProp<
  BottomTabScreenProps<ClinicTabParamList, 'Settings'>['navigation'],
  NativeStackNavigationProp<ClinicStackParamList>
>;

export function ClinicSettingsScreen(_props: Props) {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<SettingsNavigation>();
  const user = useAuthStore((s) => s.user) as ClinicUser | null;
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const { handleLogout } = useLogout();

  useEffect(() => {
    if (!user?.id) {
      void fetchProfile();
    }
  }, [fetchProfile, user?.id]);

  return (
    <ScrollView className="flex-1" contentContainerClassName="pb-10">
      <View className="bg-primary px-6 pb-8 pt-16">
        <Text className="text-sm text-blue-100">{t('tabs.settings')}</Text>
        <Text className="mt-1 text-3xl font-bold text-white">{user?.name ?? t('clinic.manager')}</Text>
        <Text className="mt-1 text-sm text-blue-100">{user?.email}</Text>
      </View>

      <View className="-mt-6 px-6">
        <Card className="mb-4" title={t('clinic.clinicInfo')}>
          <Pressable
            onPress={() => navigation.navigate('EditProfile')}
            className="mb-3 self-end rounded-full bg-primary-light px-3 py-1.5 active:opacity-80"
          >
            <Text className="text-xs font-semibold text-primary">{t('profile.editProfile')}</Text>
          </Pressable>
          <View className="mt-3 gap-3">
            <View className="flex-row justify-between">
              <Text className="text-slate-500">{t('auth.city')}</Text>
              <Text className="font-medium text-slate-900">{user?.city ?? '—'}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-slate-500">{t('auth.specialization')}</Text>
              <Text className="font-medium text-slate-900">{user?.specialization ?? '—'}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-slate-500">{t('clinic.location')}</Text>
              <Text className="font-medium text-slate-900">{user?.location ?? '—'}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-slate-500">{t('auth.phone')}</Text>
              <Text className="font-medium text-slate-900">{user?.phone ?? '—'}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-slate-500">{t('clinic.status')}</Text>
              <Text className="font-medium text-primary">{user?.status ?? 'PENDING'}</Text>
            </View>
          </View>
        </Card>

        <Card className="mb-4" title={t('common.language')}>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {languages.map((lang) => (
              <Pressable
                key={lang.code}
                onPress={() => void changeLanguage(lang.code)}
                className={`rounded-full px-4 py-2 ${i18n.language === lang.code ? 'bg-primary' : 'bg-slate-100'}`}
              >
                <Text className={`text-sm font-medium ${i18n.language === lang.code ? 'text-white' : 'text-slate-700'}`}>
                  {lang.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <SettingsAboutLink onPress={() => navigation.navigate('About')} />

        <Button title={t('common.logout')} variant="outline" onPress={() => void handleLogout()} />
      </View>
    </ScrollView>
  );
}
