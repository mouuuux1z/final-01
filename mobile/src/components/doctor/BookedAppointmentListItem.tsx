import { I18nManager, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../AppIcon';
import {
  AppointmentNumberBadge,
  formatAppointmentNumberLabel,
  hasAppointmentNumber,
} from '../appointments/AppointmentNumberBadge';
import { isAppointmentEnded } from '../../utils/appointmentHelpers';
import { UI, cardShadowStyle } from '../../theme/ui';
import type { Appointment } from '../../types';

interface BookedAppointmentListItemProps {
  appointment: Appointment;
  patientName: string;
  patientPhone?: string | null;
  onPress: () => void;
}

export function BookedAppointmentListItem({
  appointment,
  patientName,
  patientPhone,
  onPress,
}: BookedAppointmentListItemProps) {
  const { t, i18n } = useTranslation();
  const isRtl = I18nManager.isRTL || i18n.language === 'ar';
  const isPrivate = Boolean(appointment.isPrivate);
  const isEnded = isAppointmentEnded(appointment);
  const isCancelled = appointment.status === 'CANCELLED' || appointment.status === 'REJECTED';

  const displayTime = appointment.endTime
    ? `${appointment.time} - ${appointment.endTime}`
    : appointment.time;

  const displayName = isPrivate
    ? patientName || t('doctor.privateAppointment')
    : patientName;

  return (
    <Pressable
      onPress={onPress}
      className={`rounded-card border px-4 py-3 active:opacity-90 ${
        isPrivate ? 'border-purple-300 bg-purple-50/60' : 'bg-white'
      }${isEnded ? ' opacity-80' : ''}`}
      style={{ borderColor: isPrivate ? '#c084fc' : UI.border, ...cardShadowStyle() }}
    >
      <View
        className="items-center gap-3"
        style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}
      >
        <View
          className="h-11 w-11 shrink-0 items-center justify-center rounded-btn"
          style={{ backgroundColor: isPrivate ? '#f3e8ff' : UI.primaryLight }}
        >
          {isPrivate ? (
            <Text className="text-lg">🔒</Text>
          ) : (
            <AppIcon name="clock" size={18} color={UI.primary} strokeWidth={2.25} />
          )}
        </View>

        <View className="min-w-0 flex-1">
          <View
            className="items-center gap-2"
            style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}
          >
            <Text
              className={`text-sm font-bold ${isPrivate ? 'text-purple-900' : ''}`}
              style={{ color: isPrivate ? '#581c87' : UI.text.primary, textAlign: isRtl ? 'right' : 'left' }}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            {isPrivate ? (
              <View className="rounded-full bg-purple-200 px-2 py-0.5">
                <Text className="text-[10px] font-bold text-purple-900">
                  {t('doctor.privateAppointment')}
                </Text>
              </View>
            ) : null}
            {isCancelled ? (
              <View className="rounded-full bg-red-100 px-2 py-0.5">
                <Text className="text-[10px] font-bold text-red-700">
                  {appointment.status === 'REJECTED'
                    ? t('doctor.appointmentRejected')
                    : t('doctor.appointmentCancelled')}
                </Text>
              </View>
            ) : isEnded ? (
              <View className="rounded-full bg-slate-100 px-2 py-0.5">
                <Text className="text-[10px] font-bold text-slate-600">
                  {t('doctor.appointmentEnded')}
                </Text>
              </View>
            ) : null}
          </View>
          <View
            className="mt-0.5 flex-row flex-wrap items-center gap-2"
            style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}
          >
            {hasAppointmentNumber(appointment.queueNumber) ? (
              <AppointmentNumberBadge number={appointment.queueNumber} />
            ) : null}
            <Text
              className="text-xs font-medium"
              style={{ color: isPrivate ? '#7e22ce' : UI.text.secondary, textAlign: isRtl ? 'right' : 'left' }}
            >
              {displayTime}
              {hasAppointmentNumber(appointment.queueNumber)
                ? ` · ${formatAppointmentNumberLabel(appointment.queueNumber, t)}`
                : ''}
            </Text>
          </View>
          {patientPhone ? (
            <Text
              className="mt-0.5 text-xs"
              style={{ color: UI.text.muted, textAlign: isRtl ? 'right' : 'left' }}
              numberOfLines={1}
            >
              {t('auth.phone')}: {patientPhone}
            </Text>
          ) : null}
        </View>

        <View
          className="shrink-0 rounded-lg border px-3 py-2"
          style={{
            borderColor: isPrivate ? '#a855f7' : UI.primary,
            backgroundColor: isPrivate ? '#f3e8ff' : UI.primaryLight,
          }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: isPrivate ? '#7e22ce' : UI.primary }}
          >
            {t('doctor.viewPatientInfo')}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
