import { Text, View } from 'react-native';
import { UI } from '../../theme/ui';

interface AppointmentNumberBadgeProps {
  number: number;
  variant?: 'primary' | 'muted';
  size?: 'sm' | 'md';
}

export function AppointmentNumberBadge({
  number,
  variant = 'primary',
  size = 'sm',
}: AppointmentNumberBadgeProps) {
  const isPrimary = variant === 'primary';
  const isMd = size === 'md';

  return (
    <View
      className={`items-center justify-center rounded-full ${isMd ? 'min-h-[28px] min-w-[28px] px-2' : 'min-h-[22px] min-w-[22px] px-1.5'}`}
      style={{
        backgroundColor: isPrimary ? UI.primaryLight : '#F1F5F9',
      }}
    >
      <Text
        className={`font-bold ${isMd ? 'text-sm' : 'text-xs'}`}
        style={{ color: isPrimary ? UI.primary : UI.text.secondary }}
      >
        {number}
      </Text>
    </View>
  );
}

export function formatAppointmentNumberLabel(number: number, t: (key: string, opts?: Record<string, unknown>) => string) {
  return t('appointments.appointmentNumber', { number });
}

export function hasAppointmentNumber(queueNumber?: number | null): queueNumber is number {
  return typeof queueNumber === 'number' && queueNumber > 0;
}
