import { I18nManager, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppModal, appModalStyles } from '../AppModal';
import { Button } from '../Button';
import { AppIcon } from '../AppIcon';
import { formatAppointmentDate, getAppointmentDateKey, getDayChipLabels } from '../../utils/appointmentHelpers';
import type { Appointment } from '../../types';
import { UI, cardShadowStyle } from '../../theme/ui';

interface BookedAppointmentDetailModalProps {
  visible: boolean;
  appointment: Appointment | null;
  onClose: () => void;
}

function InfoRow({ icon, label, value }: { icon: 'profile' | 'phone' | 'messages' | 'calendar' | 'clock'; label: string; value: string }) {
  const { i18n } = useTranslation();
  const isRtl = I18nManager.isRTL || i18n.language === 'ar';

  return (
    <View
      className="items-start gap-3 py-2.5"
      style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}
    >
      <View className="h-9 w-9 items-center justify-center rounded-btn" style={{ backgroundColor: UI.primaryLight }}>
        <AppIcon name={icon} size={16} color={UI.primary} strokeWidth={2} />
      </View>
      <View className="flex-1">
        <Text
          className="text-xs font-medium"
          style={{ color: UI.text.muted, textAlign: isRtl ? 'right' : 'left' }}
        >
          {label}
        </Text>
        <Text
          className="mt-0.5 text-sm font-semibold"
          style={{ color: UI.text.primary, textAlign: isRtl ? 'right' : 'left' }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

export function BookedAppointmentDetailModal({ visible, appointment, onClose }: BookedAppointmentDetailModalProps) {
  const { t, i18n } = useTranslation();

  if (!appointment) {
    return null;
  }

  const patientName = appointment.patient?.name ?? appointment.patientName ?? t('doctor.unknownPatient');
  const patientPhone = appointment.patient?.phone ?? appointment.patientPhone ?? '—';
  const dateKey = getAppointmentDateKey(appointment.date);
  const dateLabels = getDayChipLabels(dateKey, t, i18n.language);
  const formattedDate = `${dateLabels.weekday} ${dateLabels.dayNumber} ${dateLabels.month}`;

  const isRtl = I18nManager.isRTL || i18n.language === 'ar';

  return (
    <AppModal visible={visible} onRequestClose={onClose} onBackdropPress={onClose}>
      <View className="border-b px-6 py-4" style={{ borderColor: UI.border }}>
        <Text
          className="text-lg font-bold"
          style={{ color: UI.text.primary, textAlign: isRtl ? 'right' : 'left' }}
        >
          {t('doctor.bookedAppointmentPatientInfo')}
        </Text>
        <Text
          className="mt-1 text-sm"
          style={{ color: UI.text.secondary, textAlign: isRtl ? 'right' : 'left' }}
        >
          {formattedDate} · {appointment.time}
        </Text>
      </View>

      <ScrollView style={appModalStyles.scroll} contentContainerStyle={appModalStyles.scrollContent}>
        <View className="px-6 pt-4">
          <View className="rounded-card bg-medical-card p-4" style={cardShadowStyle()}>
            <InfoRow icon="profile" label={t('doctor.patientName')} value={patientName} />
            <InfoRow icon="phone" label={t('doctor.phone')} value={patientPhone} />
            <InfoRow
              icon="calendar"
              label={t('appointments.date')}
              value={formatAppointmentDate(appointment.date, i18n.language)}
            />
            <InfoRow icon="clock" label={t('appointments.time')} value={appointment.time} />
            <View className="mt-2 self-start rounded-full px-3 py-1" style={{ backgroundColor: UI.primaryLight }}>
              <Text className="text-xs font-semibold" style={{ color: UI.primary }}>
                {t(`common.${appointment.status.toLowerCase()}` as 'common.pending', { defaultValue: appointment.status })}
              </Text>
            </View>
            {appointment.notes ? (
              <View className="mt-4 border-t pt-4" style={{ borderColor: UI.border }}>
                <InfoRow icon="messages" label={t('appointments.notes')} value={appointment.notes} />
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <View className="border-t px-6 py-4" style={{ borderColor: UI.border }}>
        <Button title={t('common.back')} variant="outline" onPress={onClose} />
      </View>
    </AppModal>
  );
}
