import { I18nManager, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BookingScanBar } from './BookingScanBar';
import { AppIcon, type AppIconName } from '../AppIcon';
import { UI, cardShadowStyle } from '../../theme/ui';
import {
  buildAppointmentQrPayload,
  formatBookingReference,
  getAppointmentDateKey,
  getDayChipLabels,
} from '../../utils/appointmentHelpers';
import { getDoctorDisplayLocation } from '../../utils/doctorLocation';
import type { Appointment } from '../../types';

interface BookingReceiptCardProps {
  appointment: Appointment;
}

interface ReceiptRowProps {
  icon: AppIconName;
  label: string;
  value: string;
}

function ReceiptRow({ icon, label, value }: ReceiptRowProps) {
  const { i18n } = useTranslation();
  const isRtl = I18nManager.isRTL || i18n.language === 'ar';

  return (
    <View
      className="flex-row items-start gap-3 py-2.5"
      style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}
    >
      <View
        className="h-9 w-9 shrink-0 items-center justify-center rounded-btn"
        style={{ backgroundColor: UI.primaryLight }}
      >
        <AppIcon name={icon} size={16} color={UI.primary} strokeWidth={2} />
      </View>
      <View className="flex-1" style={{ alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
        <Text className="text-xs font-medium" style={{ color: UI.text.muted }}>
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

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: '#FFF7ED', text: '#EA580C' },
  CONFIRMED: { bg: '#F0FDF4', text: '#16A34A' },
  CANCELLED: { bg: '#FEF2F2', text: '#DC2626' },
  COMPLETED: { bg: '#F1F5F9', text: '#64748B' },
  REJECTED: { bg: '#FEF2F2', text: '#DC2626' },
  NO_SHOW: { bg: '#FEF2F2', text: '#DC2626' },
};

export function BookingReceiptCard({ appointment }: BookingReceiptCardProps) {
  const { t, i18n } = useTranslation();
  const dateKey = getAppointmentDateKey(appointment.date);
  const dateLabels = getDayChipLabels(dateKey, t, i18n.language);
  const formattedDate = `${dateLabels.weekday} ${dateLabels.dayNumber} ${dateLabels.month}`;
  const reference = formatBookingReference(appointment.id);
  const statusStyle = STATUS_STYLE[appointment.status] ?? STATUS_STYLE.PENDING;
  const doctorLocation = appointment.doctor
    ? getDoctorDisplayLocation(appointment.doctor)
    : null;

  return (
    <View
      className="overflow-hidden rounded-card border bg-medical-card"
      style={{
        borderColor: UI.border,
        ...cardShadowStyle(),
      }}
    >
      <View className="h-2" style={{ backgroundColor: UI.primary }} />

      <View className="items-center px-5 pb-2 pt-6">
        <View
          className="mb-4 h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: '#F0FDF4' }}
        >
          <AppIcon name="check" size={32} color="#16A34A" strokeWidth={2} />
        </View>
        <Text className="text-xl font-bold" style={{ color: UI.text.primary }}>
          {t('appointments.receiptTitle')}
        </Text>
        <Text className="mt-1 text-center text-sm" style={{ color: UI.text.secondary }}>
          {t('appointments.receiptSubtitle')}
        </Text>
      </View>

      <View className="items-center px-5 py-4">
        <BookingScanBar value={buildAppointmentQrPayload(appointment.id)} />
        <Text className="mt-3 text-xs font-medium" style={{ color: UI.text.muted }}>
          {t('appointments.receiptReference')}
        </Text>
        <Text className="mt-0.5 text-lg font-bold tracking-widest" style={{ color: UI.primary }}>
          #{reference}
        </Text>
      </View>

      <View
        className="mx-5 border-t border-dashed"
        style={{ borderColor: UI.border }}
      />

      <View className="px-5 py-2">
        <ReceiptRow
          icon="profile"
          label={t('appointments.receiptPatient')}
          value={appointment.patientName ?? appointment.patient?.name ?? '—'}
        />
        <ReceiptRow
          icon="doctors"
          label={t('appointments.receiptDoctor')}
          value={appointment.doctor?.name ?? '—'}
        />
        {appointment.doctor?.specialization ? (
          <ReceiptRow
            icon="doctors"
            label={t('home.specialtyLabel')}
            value={appointment.doctor.specialization}
          />
        ) : null}
        <ReceiptRow icon="calendar" label={t('appointments.date')} value={formattedDate} />
        <ReceiptRow icon="clock" label={t('appointments.time')} value={appointment.time} />
        {appointment.doctor?.city ? (
          <ReceiptRow icon="clinic" label={t('appointments.receiptCity')} value={appointment.doctor.city} />
        ) : null}
        {doctorLocation ? (
          <ReceiptRow icon="location" label={t('appointments.receiptLocation')} value={doctorLocation} />
        ) : null}
        {appointment.notes?.trim() ? (
          <ReceiptRow icon="messages" label={t('appointments.notes')} value={appointment.notes.trim()} />
        ) : null}
      </View>

      <View className="mx-5 mb-5 mt-1 flex-row items-center justify-between rounded-btn px-4 py-3" style={{ backgroundColor: UI.primaryLight }}>
        <Text className="text-sm font-medium" style={{ color: UI.text.secondary }}>
          {t('appointments.status')}
        </Text>
        <View className="rounded-full px-3 py-1" style={{ backgroundColor: statusStyle.bg }}>
          <Text className="text-xs font-bold" style={{ color: statusStyle.text }}>
            {t(`common.${appointment.status.toLowerCase()}` as 'common.pending', { defaultValue: appointment.status })}
          </Text>
        </View>
      </View>

      <View className="items-center border-t px-5 py-4" style={{ borderColor: UI.border, backgroundColor: UI.input }}>
        <Text className="text-xs font-bold tracking-wide" style={{ color: UI.primary }}>
          MYDoc
        </Text>
        <Text className="mt-0.5 text-[10px]" style={{ color: UI.text.muted }}>
          {t('appointments.receiptFooter')}
        </Text>
      </View>
    </View>
  );
}
