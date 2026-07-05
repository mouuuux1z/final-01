import { StyleSheet, Text, View } from 'react-native';
import { AppIcon, type AppIconName } from '../AppIcon';
import { useTypography } from '../../hooks/useTypography';

type StatTone = 'primary' | 'success' | 'danger' | 'info';

const TONE_STYLES: Record<StatTone, { iconBg: string; iconColor: string }> = {
  primary: { iconBg: '#E8F0FF', iconColor: '#4F86F7' },
  success: { iconBg: '#E8F8EF', iconColor: '#16A34A' },
  danger: { iconBg: '#FEECEC', iconColor: '#DC2626' },
  info: { iconBg: '#F0EBFF', iconColor: '#7C3AED' },
};

interface DoctorStatCardProps {
  value: string | number;
  label: string;
  icon: AppIconName;
  tone?: StatTone;
}

export function DoctorStatCard({ value, label, icon, tone = 'primary' }: DoctorStatCardProps) {
  const typography = useTypography();
  const toneStyle = TONE_STYLES[tone];

  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: toneStyle.iconBg }]}>
        <AppIcon name={icon} size={22} color={toneStyle.iconColor} strokeWidth={2.25} />
      </View>

      <View style={styles.textGroup}>
        <Text
          style={[styles.value, { fontFamily: typography.fontFamily, fontWeight: typography.headingWeight }]}
          numberOfLines={1}
        >
          {String(value)}
        </Text>
        <Text
          style={[styles.label, { fontFamily: typography.fontFamilyRegular, fontWeight: typography.bodyWeight }]}
          numberOfLines={2}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EEF8',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textGroup: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  value: {
    fontSize: 24,
    lineHeight: 28,
    color: '#0F172A',
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    color: '#64748B',
  },
});
