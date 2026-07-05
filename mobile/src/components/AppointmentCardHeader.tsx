import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from './AppIcon';
import { UI, cardShadowStyle } from '../theme/ui';
import { useTypography } from '../hooks/useTypography';
import { formatAppointmentDate } from '../utils/appointmentHelpers';

interface AppointmentCardHeaderProps {
  index: number;
  title: string;
  date: string;
  time: string;
  onChatPress?: () => void;
  chatLabel?: string;
}

export function AppointmentCardHeader({
  index,
  title,
  date,
  time,
  onChatPress,
  chatLabel,
}: AppointmentCardHeaderProps) {
  const { i18n } = useTranslation();
  const typography = useTypography();

  return (
    <View className="flex-row items-start gap-3">
      <View
        className="h-10 min-w-[40px] items-center justify-center rounded-pill px-2"
        style={{ backgroundColor: UI.primary, ...cardShadowStyle() }}
      >
        <Text className="text-base font-bold text-white">{index}</Text>
      </View>

      <View className="flex-1">
        <Text
          className="text-lg text-heading"
          style={{ fontFamily: typography.fontFamily, fontWeight: typography.headingWeight }}
        >
          {title}
        </Text>

        <View className="mt-2.5 gap-2">
          <View className="flex-row items-center gap-2.5">
            <View className="h-8 w-8 items-center justify-center rounded-pill" style={{ backgroundColor: UI.input }}>
              <AppIcon name="calendar" size={16} color={UI.text.secondary} strokeWidth={2.25} />
            </View>
            <Text className="text-sm font-medium text-body">{formatAppointmentDate(date, i18n.language)}</Text>
          </View>

          <View className="flex-row items-center gap-2.5">
            <View className="h-8 w-8 items-center justify-center rounded-pill" style={{ backgroundColor: UI.input }}>
              <AppIcon name="clock" size={16} color={UI.primary} strokeWidth={2.5} />
            </View>
            <Text className="text-base font-bold text-primary">{time}</Text>
          </View>
        </View>
      </View>

      {onChatPress ? (
        <Pressable
          onPress={onChatPress}
          accessibilityLabel={chatLabel}
          className="h-11 w-11 items-center justify-center rounded-pill active:opacity-80"
          style={{ backgroundColor: UI.input }}
        >
          <AppIcon name="messages" size={22} color={UI.primary} strokeWidth={2.25} />
        </Pressable>
      ) : null}
    </View>
  );
}
