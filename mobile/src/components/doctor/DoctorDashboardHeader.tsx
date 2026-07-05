import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../AppIcon';
import { useTypography } from '../../hooks/useTypography';
import type { DoctorUser } from '../../types';

const HEADER_GRADIENT = ['#3D73E8', '#5B93FA'] as const;

interface DoctorDashboardHeaderProps {
  user: DoctorUser | null;
  unreadCount?: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onProfilePress?: () => void;
  onNotificationsPress?: () => void;
}

function getGreetingKey(hour: number): 'doctor.greetingMorning' | 'doctor.greetingAfternoon' | 'doctor.greetingEvening' {
  if (hour < 12) return 'doctor.greetingMorning';
  if (hour < 17) return 'doctor.greetingAfternoon';
  return 'doctor.greetingEvening';
}

function getDisplayName(name?: string): string {
  if (!name?.trim()) return '';
  return name
    .trim()
    .replace(/^(الدكتور|د\.?|دكتور|dr\.?|doctor)\s+/i, '')
    .trim();
}

export function DoctorDashboardHeader({
  user,
  unreadCount = 0,
  searchQuery,
  onSearchChange,
  onProfilePress,
  onNotificationsPress,
}: DoctorDashboardHeaderProps) {
  const { t } = useTranslation();
  const typography = useTypography();
  const insets = useSafeAreaInsets();
  const greetingKey = getGreetingKey(new Date().getHours());
  const displayName = getDisplayName(user?.name) || t('doctor.dashboard');

  return (
    <LinearGradient
      colors={[...HEADER_GRADIENT]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top + 40 }]}
    >
      <View style={styles.profileRow}>
        <View style={styles.profileGroup}>
          <Pressable
            onPress={onProfilePress}
            style={({ pressed }) => [styles.avatar, pressed && styles.avatarPressed]}
            accessibilityRole="button"
            accessibilityLabel={t('tabs.settings')}
          >
            {user?.image ? (
              <Image source={{ uri: user.image }} style={styles.avatarImage} />
            ) : (
              <AppIcon name="profile" size={22} color="#FFFFFF" strokeWidth={2.25} />
            )}
          </Pressable>

          <View style={styles.textGroup}>
            <Text style={[styles.greeting, { fontFamily: typography.fontFamily }]}>
              {t(greetingKey, { name: displayName })}
            </Text>
            <Text style={[styles.subtitle, { fontFamily: typography.fontFamilyRegular }]}>
              {user?.specialization || t('doctor.howAreYouToday')}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onNotificationsPress}
          style={({ pressed }) => [styles.notificationButton, pressed && styles.notificationButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel={t('tabs.notifications')}
        >
          <AppIcon name="bell" size={20} color="#4F86F7" strokeWidth={2.25} />
          {unreadCount > 0 ? <View style={styles.notificationBadge} /> : null}
        </Pressable>
      </View>

      <View style={styles.searchBar}>
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder={t('doctor.searchPatientsPlaceholder')}
          placeholderTextColor="#A0AEC0"
          style={[styles.searchInput, { fontFamily: typography.fontFamilyRegular }]}
          returnKeyType="search"
        />
        <AppIcon name="search" size={20} color="#A0AEC0" strokeWidth={2} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  profileGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#3B6FE8',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarPressed: {
    opacity: 0.9,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  textGroup: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  subtitle: {
    color: '#E8F1FF',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationButtonPressed: {
    opacity: 0.85,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4D4F',
  },
  searchBar: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#2D3748',
    paddingVertical: 0,
  },
});
