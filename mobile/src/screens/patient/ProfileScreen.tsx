import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { AppIcon } from '../../components/AppIcon';
import { Button } from '../../components/Button';
import { SettingsAboutLink } from '../../components/settings/SettingsAboutLink';
import { DeleteAccountButton } from '../../components/settings/DeleteAccountButton';
import { ScreenShell } from '../../components/ui/ScreenShell';
import { UI } from '../../theme/ui';
import { changeLanguage, languages } from '../../i18n';
import { ATTENDANCE_COMMITMENT_MAX, BOOKING_BLOCK_DAYS, normalizeCommitmentPoints } from '../../constants/attendance';
import { useLogout } from '../../hooks/useLogout';
import { useAuthStore } from '../../store/authStore';
import type { PatientUser } from '../../types';
import type { PatientTabParamList, PatientStackParamList } from '../../navigation/PatientTabs';

type Props = BottomTabScreenProps<PatientTabParamList, 'Profile'>;
type ProfileNavigation = NativeStackNavigationProp<PatientStackParamList>;

function ProfileCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <View
      className={`mb-4 rounded-card border bg-white p-4 ${className ?? ''}`}
      style={{ borderColor: UI.border, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}
    >
      {children}
    </View>
  );
}

export function ProfileScreen(_props: Props) {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<ProfileNavigation>();
  const user = useAuthStore((s) => s.user) as PatientUser | null;
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const { handleLogout } = useLogout();
  const commitmentPoints = normalizeCommitmentPoints(user?.attendancePoints);
  const isBookingBlocked = user?.bookingBlockedUntil != null && new Date(user.bookingBlockedUntil) > new Date();

  useEffect(() => {
    if (!user?.id) {
      void fetchProfile();
    }
  }, [fetchProfile, user?.id]);

  return (
    <ScreenShell contentContainerClassName="pb-6">
      <Text className="mb-5 text-2xl font-bold text-on-sky">{t('tabs.myAccount')}</Text>

      <ProfileCard className="items-center">
        <View className="mb-3 h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: UI.primaryLight }}>
          <AppIcon name="profile" size={28} color={UI.primary} strokeWidth={2} />
        </View>
        <Text className="text-lg font-bold" style={{ color: UI.text.primary }}>{user?.name}</Text>
        <Text className="mt-0.5 text-sm" style={{ color: UI.text.secondary }}>{user?.email}</Text>
      </ProfileCard>

      <ProfileCard>
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-base font-bold" style={{ color: UI.text.primary }}>{t('profile.personalInfo')}</Text>
          <Pressable
            onPress={() => navigation.navigate('EditProfile')}
            className="rounded-full px-3 py-1.5 active:opacity-80"
            style={{ backgroundColor: UI.primaryLight }}
          >
            <Text className="text-xs font-semibold" style={{ color: UI.primary }}>{t('profile.editProfile')}</Text>
          </Pressable>
        </View>
        <View className="gap-3">
          <View className="flex-row justify-between">
            <Text style={{ color: UI.text.secondary }}>{t('auth.phone')}</Text>
            <Text className="font-semibold" style={{ color: UI.text.primary }}>{user?.phone ?? '—'}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text style={{ color: UI.text.secondary }}>{t('profile.commitmentScore')}</Text>
            <Text className="font-semibold" style={{ color: UI.primary }}>{commitmentPoints}/{ATTENDANCE_COMMITMENT_MAX}</Text>
          </View>
          {isBookingBlocked ? (
            <View className="rounded-btn bg-red-50 px-3 py-3">
              <Text className="text-sm font-semibold text-red-700">{t('profile.bookingBlockedTitle')}</Text>
              <Text className="mt-1 text-xs text-red-600">{t('profile.bookingBlockedMessage', { date: new Date(user!.bookingBlockedUntil!).toLocaleDateString(), days: BOOKING_BLOCK_DAYS })}</Text>
            </View>
          ) : (
            <Text className="text-xs leading-5" style={{ color: UI.text.muted }}>{t('profile.commitmentHint')}</Text>
          )}
        </View>
      </ProfileCard>

      <SettingsAboutLink onPress={() => navigation.navigate('About')} />

      <ProfileCard>
        <Text className="mb-3 text-base font-bold" style={{ color: UI.text.primary }}>{t('common.language')}</Text>
        <View className="flex-row flex-wrap gap-2">
          {languages.map((lang) => (
            <Pressable
              key={lang.code}
              onPress={() => changeLanguage(lang.code)}
              className="rounded-full px-4 py-2 active:opacity-90"
              style={{ backgroundColor: i18n.language === lang.code ? UI.primary : UI.primaryLight }}
            >
              <Text className="text-sm font-semibold" style={{ color: i18n.language === lang.code ? '#FFF' : UI.primary }}>
                {lang.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ProfileCard>

      <Button title={t('common.logout')} variant="outline" onPress={() => void handleLogout()} />

      <ProfileCard className="mt-4">
        <Text className="mb-3 text-base font-bold" style={{ color: UI.text.primary }}>{t('doctor.accountActions')}</Text>
        <DeleteAccountButton />
      </ProfileCard>
    </ScreenShell>
  );
}
