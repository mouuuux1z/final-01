import { I18nManager, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../AppIcon';
import { UI, cardShadowStyle } from '../../theme/ui';
import type { Appointment } from '../../types';

interface BookedAppointmentListItemProps {
  appointment: Appointment;
  patientName: string;
  onPress: () => void;
}

export function BookedAppointmentListItem({ appointment, patientName, onPress }: BookedAppointmentListItemProps) {
  const { t, i18n } = useTranslation();
  const isRtl = I18nManager.isRTL || i18n.language === 'ar';

  return (
    <Pressable
      onPress={onPress}
      className="rounded-card border bg-white px-4 py-3 active:opacity-90"
      style={{ borderColor: UI.border, ...cardShadowStyle() }}
    >
      <View
        className="items-center gap-3"
        style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}
      >
        <View
          className="h-11 w-11 shrink-0 items-center justify-center rounded-btn"
          style={{ backgroundColor: UI.primaryLight }}
        >
          <AppIcon name="clock" size={18} color={UI.primary} strokeWidth={2.25} />
        </View>

        <View className="min-w-0 flex-1">
          <Text
            className="text-sm font-bold"
            style={{ color: UI.text.primary, textAlign: isRtl ? 'right' : 'left' }}
            numberOfLines={1}
          >
            {patientName}
          </Text>
          <Text
            className="mt-0.5 text-xs font-medium"
            style={{ color: UI.text.secondary, textAlign: isRtl ? 'right' : 'left' }}
          >
            {appointment.time}
          </Text>
        </View>

        <View
          className="shrink-0 rounded-lg border px-3 py-2"
          style={{ borderColor: UI.primary, backgroundColor: UI.primaryLight }}
        >
          <Text className="text-xs font-semibold" style={{ color: UI.primary }}>
            {t('doctor.viewPatientInfo')}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
