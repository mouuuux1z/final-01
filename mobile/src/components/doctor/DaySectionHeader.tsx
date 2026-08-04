import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppLoader } from '../AppLoader';
import { useTranslation } from 'react-i18next';
import { getDayChipLabels, toDateInputValue } from '../../utils/appointmentHelpers';
import { useTypography } from '../../hooks/useTypography';
import { UI, cardShadowStyle } from '../../theme/ui';

interface DaySectionHeaderProps {
  dateKey: string;
  onDelete?: () => void;
  deleteLabel?: string;
  deletePending?: boolean;
}

export function DaySectionHeader({
  dateKey,
  onDelete,
  deleteLabel,
  deletePending = false,
}: DaySectionHeaderProps) {
  const { t, i18n } = useTranslation();
  const typography = useTypography();
  const labels = getDayChipLabels(dateKey, t, i18n.language);
  const isToday = dateKey === toDateInputValue();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.dayBadge, isToday && styles.dayBadgeToday]}>
          <Text
            style={[
              styles.dayNumber,
              { fontFamily: typography.fontFamily, fontWeight: typography.headingWeight },
              isToday && styles.dayNumberToday,
            ]}
          >
            {labels.dayNumber}
          </Text>
        </View>

        <View style={styles.textGroup}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.weekday,
                { fontFamily: typography.fontFamily, fontWeight: typography.headingWeight },
              ]}
            >
              {labels.weekday}
            </Text>
            {isToday ? (
              <View style={styles.todayChip}>
                <Text style={[styles.todayChipText, { fontFamily: typography.fontFamilyMedium }]}>
                  {t('doctor.todayLabel')}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.month, { fontFamily: typography.fontFamilyRegular }]}>{labels.month}</Text>
        </View>

        {onDelete ? (
          <Pressable
            onPress={onDelete}
            disabled={deletePending}
            style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}
          >
            {deletePending ? (
              <AppLoader size="small" color="#DC2626" />
            ) : (
              <Text style={[styles.deleteText, { fontFamily: typography.fontFamilyMedium }]}>
                {deleteLabel}
              </Text>
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: UI.surface,
    borderWidth: 1,
    borderColor: UI.border,
    borderRadius: UI.radius.card,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    ...cardShadowStyle(),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#D7E6FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dayBadgeToday: {
    backgroundColor: UI.primary,
    borderColor: UI.primary,
  },
  dayNumber: {
    fontSize: 20,
    lineHeight: 24,
    color: UI.primary,
  },
  dayNumberToday: {
    color: '#FFFFFF',
  },
  textGroup: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  weekday: {
    fontSize: 16,
    lineHeight: 22,
    color: UI.text.primary,
  },
  month: {
    fontSize: 14,
    lineHeight: 20,
    color: UI.text.secondary,
    fontWeight: '500',
  },
  todayChip: {
    borderRadius: 999,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  todayChipText: {
    fontSize: 11,
    lineHeight: 14,
    color: '#15803D',
    fontWeight: '600',
  },
  deleteButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonPressed: {
    opacity: 0.85,
  },
  deleteText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#DC2626',
    fontWeight: '600',
  },
});
