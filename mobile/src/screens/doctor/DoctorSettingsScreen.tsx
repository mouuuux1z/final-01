import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { AppIcon } from '../../components/AppIcon';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { changeLanguage, languages } from '../../i18n';
import { useLogout } from '../../hooks/useLogout';
import { SettingsAboutLink } from '../../components/settings/SettingsAboutLink';
import { useAuthStore } from '../../store/authStore';
import { UI } from '../../theme/ui';
import { getDoctorDisplayLocation } from '../../utils/doctorLocation';
import type { DoctorUser } from '../../types';
import type { DoctorTabParamList } from '../../navigation/DoctorTabs';
import type { DoctorRootStackParamList } from '../../navigation/DoctorRootStack';

type Props = BottomTabScreenProps<DoctorTabParamList, 'Settings'>;
type SettingsNavigation = CompositeNavigationProp<
  BottomTabScreenProps<DoctorTabParamList, 'Settings'>['navigation'],
  NativeStackNavigationProp<DoctorRootStackParamList>
>;

function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  trailing,
}: {
  icon: 'profile' | 'settings' | 'doctors';
  title: string;
  subtitle?: string;
  onPress?: () => void;
  trailing?: ReactNode;
}) {
  const content = (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-1 flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-btn bg-primary-light">
          <AppIcon name={icon} size={20} color={UI.primary} strokeWidth={2} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-slate-900">{title}</Text>
          {subtitle ? <Text className="mt-0.5 text-sm text-slate-500">{subtitle}</Text> : null}
        </View>
      </View>
      {trailing}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-70">
        {content}
      </Pressable>
    );
  }

  return content;
}

export function DoctorSettingsScreen(_props: Props) {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<SettingsNavigation>();
  const user = useAuthStore((s) => s.user) as DoctorUser | null;
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const { handleLogout } = useLogout();

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  return (
    <ScrollView className="flex-1" contentContainerClassName="pb-10">
      <View className="bg-primary px-6 pb-10 pt-16">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-card bg-white/20">
            <AppIcon name="settings" size={24} color="#FFFFFF" strokeWidth={2} />
          </View>
          <View className="flex-1">
            <Text className="text-3xl font-bold text-white">{t('doctor.settings')}</Text>
            <Text className="mt-1 text-base text-blue-100">{t('doctor.settingsHint')}</Text>
          </View>
        </View>
      </View>

      <View className="-mt-6 px-6">
        <Card className="mb-4">
          <View className="mb-4 h-16 w-16 items-center justify-center self-center rounded-full bg-primary-light">
            <AppIcon name="doctors" size={28} color={UI.primary} strokeWidth={2} />
          </View>
          <Text className="text-center text-xl font-bold text-slate-900">{user?.name}</Text>
          <Text className="mt-1 text-center text-sm text-slate-500">{user?.email}</Text>
          {user?.specialization ? (
            <Text className="mt-1 text-center text-sm text-primary">{user.specialization}</Text>
          ) : null}
        </Card>

        <Card className="mb-4" title={t('profile.personalInfo')}>
          <Pressable
            onPress={() => navigation.navigate('EditProfile')}
            className="mb-3 self-end rounded-full bg-primary-light px-3 py-1.5 active:opacity-80"
          >
            <Text className="text-xs font-semibold text-primary">{t('profile.editProfile')}</Text>
          </Pressable>
          <View className="mt-1 divide-y divide-slate-100">
            <SettingsRow icon="profile" title={t('auth.phone')} subtitle={user?.phone ?? '—'} />
            <SettingsRow icon="profile" title={t('auth.city')} subtitle={user?.city ?? '—'} />
            <SettingsRow
              icon="profile"
              title={t('doctor.location')}
              subtitle={getDoctorDisplayLocation(user ?? {}) ?? '—'}
            />
            <SettingsRow
              icon="profile"
              title={t('profile.accountStatus')}
              subtitle={user?.status ?? 'ACTIVE'}
            />
          </View>
        </Card>

        <Card className="mb-4" title={t('doctor.settingsSection')}>
          <SettingsAboutLink variant="plain" onPress={() => navigation.navigate('About')} />

          <View className="mt-2 border-t border-slate-100 pt-4">
            <Text className="mb-2 text-sm font-medium text-slate-700">{t('common.language')}</Text>
            <View className="flex-row flex-wrap gap-2">
              {languages.map((lang) => (
                <Pressable
                  key={lang.code}
                  onPress={() => changeLanguage(lang.code)}
                  className={`rounded-full px-4 py-2 ${i18n.language === lang.code ? 'bg-primary' : 'bg-slate-100'}`}
                >
                  <Text className={`text-sm font-medium ${i18n.language === lang.code ? 'text-white' : 'text-slate-700'}`}>
                    {lang.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Card>

        <Card className="mb-4" title={t('doctor.accountActions')}>
          <Text className="text-sm text-slate-500">{t('doctor.logoutHint')}</Text>
          <Button title={t('common.logout')} variant="outline" onPress={() => void handleLogout()} className="mt-4" />
        </Card>
      </View>
    </ScrollView>
  );
}
