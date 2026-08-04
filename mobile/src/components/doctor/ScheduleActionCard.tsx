import { Pressable, Text, View } from 'react-native';
import { AppIcon, type AppIconName } from '../AppIcon';
import { UI, cardShadowStyle } from '../../theme/ui';
import { useTypography } from '../../hooks/useTypography';

interface ScheduleActionCardProps {
  title: string;
  subtitle: string;
  icon: AppIconName;
  iconBackground?: string;
  iconColor?: string;
  onPress: () => void;
}

export function ScheduleActionCard({
  title,
  subtitle,
  icon,
  iconBackground = UI.primaryLight,
  iconColor = UI.primary,
  onPress,
}: ScheduleActionCardProps) {
  const typography = useTypography();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="active:opacity-90"
    >
      <View
        className="flex-row items-center rounded-card border bg-white px-4 py-4"
        style={{ borderColor: UI.border, ...cardShadowStyle() }}
      >
        <View
          className="h-12 w-12 items-center justify-center rounded-btn"
          style={{ backgroundColor: iconBackground }}
        >
          <AppIcon name={icon} size={22} color={iconColor} strokeWidth={2.25} />
        </View>

        <View className="mx-3 min-w-0 flex-1">
          <Text
            className="text-base"
            style={{
              color: UI.text.primary,
              fontFamily: typography.fontFamilyMedium,
              fontWeight: '600',
            }}
          >
            {title}
          </Text>
          <Text
            className="mt-1 text-xs leading-5"
            style={{ color: UI.text.secondary, fontFamily: typography.fontFamilyRegular }}
          >
            {subtitle}
          </Text>
        </View>

        <Text className="text-xl font-semibold" style={{ color: UI.primary }}>
          ›
        </Text>
      </View>
    </Pressable>
  );
}
