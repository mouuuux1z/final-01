import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../AppIcon';
import { GlassSurface } from './GlassSurface';
import { useTypography } from '../../hooks/useTypography';
import {
  ATTENDANCE_COMMITMENT_MAX,
  BOOKING_BLOCK_DAYS,
  normalizeCommitmentPoints,
} from '../../constants/attendance';
import { useAuthStore } from '../../store/authStore';
import { UI } from '../../theme/ui';
import type { PatientUser } from '../../types';

export function CommitmentBalanceCard() {
  const { t } = useTranslation();
  const typography = useTypography();
  const user = useAuthStore((s) => s.user) as PatientUser | null;
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const points = normalizeCommitmentPoints(user?.attendancePoints);
  const isBookingBlocked =
    user?.bookingBlockedUntil != null && new Date(user.bookingBlockedUntil) > new Date();

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  return (
    <GlassSurface style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <AppIcon name="shield" size={22} color={UI.primary} strokeWidth={2.25} />
        </View>
        <View style={styles.titleWrap}>
          <Text
            style={[styles.title, { fontFamily: typography.fontFamily, fontWeight: typography.headingWeight }]}
          >
            {t('home.commitmentBalance')}
          </Text>
          <Text style={[styles.subtitle, { fontFamily: typography.fontFamilyRegular }]}>
            {t('home.commitmentBalanceHint')}
          </Text>
        </View>
        <Text
          style={[styles.score, { fontFamily: typography.fontFamily, fontWeight: typography.headingWeight }]}
        >
          {points}/{ATTENDANCE_COMMITMENT_MAX}
        </Text>
      </View>

      <View style={styles.dotsRow}>
        {Array.from({ length: ATTENDANCE_COMMITMENT_MAX }, (_, index) => {
          const filled = index < points;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                filled ? styles.dotFilled : styles.dotEmpty,
              ]}
            />
          );
        })}
      </View>

      {isBookingBlocked ? (
        <View style={styles.blockedBox}>
          <Text style={[styles.blockedTitle, { fontFamily: typography.fontFamilyMedium }]}>
            {t('profile.bookingBlockedTitle')}
          </Text>
          <Text style={[styles.blockedText, { fontFamily: typography.fontFamilyRegular }]}>
            {t('profile.bookingBlockedMessage', {
              date: new Date(user!.bookingBlockedUntil!).toLocaleDateString(),
              days: BOOKING_BLOCK_DAYS,
            })}
          </Text>
        </View>
      ) : null}
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: UI.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    color: UI.text.primary,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    color: UI.text.secondary,
  },
  score: {
    fontSize: 24,
    lineHeight: 28,
    color: UI.primary,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  dot: {
    flex: 1,
    height: 8,
    borderRadius: 999,
  },
  dotFilled: {
    backgroundColor: UI.primary,
  },
  dotEmpty: {
    backgroundColor: 'rgba(0, 102, 255, 0.15)',
  },
  blockedBox: {
    marginTop: 12,
    borderRadius: UI.radius.button,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  blockedTitle: {
    fontSize: 12,
    color: '#B91C1C',
  },
  blockedText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    color: '#DC2626',
  },
});
