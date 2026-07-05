import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppIcon, type AppIconName } from '../AppIcon';
import { useTypography } from '../../hooks/useTypography';
import { UI } from '../../theme/ui';
import { GlassSurface } from './GlassSurface';

interface StatCardProps {
  value: string | number;
  label: string;
  icon: AppIconName;
  compact?: boolean;
}

export function DashboardStatsRow({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

export function StatCard({ value, label, icon, compact = true }: StatCardProps) {
  const typography = useTypography();

  return (
    <View style={styles.wrap}>
      <GlassSurface style={[styles.surface, compact ? styles.surfaceCompact : undefined]}>
        <View style={styles.iconBox}>
          <AppIcon name={icon} size={compact ? 20 : 22} color={UI.primary} strokeWidth={2} />
        </View>
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
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
    paddingHorizontal: 24,
    marginTop: -24,
  },
  wrap: {
    flex: 1,
    minWidth: 0,
    width: '100%',
  },
  surface: {
    flex: 1,
    padding: 16,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 6,
  },
  surfaceCompact: {
    padding: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: UI.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 22,
    lineHeight: 26,
    color: UI.text.primary,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    color: UI.text.secondary,
    width: '100%',
  },
});
