import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatAppointmentDate } from '../../utils/appointmentHelpers';
import { UI } from '../../theme/ui';

interface ReviewCardProps {
  patientName: string;
  rating: number;
  comment?: string | null;
  createdAt?: string;
  showBorder?: boolean;
}

export function ReviewCard({ patientName, rating, comment, createdAt, showBorder = true }: ReviewCardProps) {
  const { i18n } = useTranslation();

  return (
    <View
      className={showBorder ? 'border-b pb-4' : 'pb-2'}
      style={showBorder ? { borderColor: UI.border } : undefined}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold" style={{ color: UI.text.primary }}>
          {patientName}
        </Text>
        <Text className="text-sm font-bold text-amber-500">★ {rating}</Text>
      </View>
      {createdAt ? (
        <Text className="mt-1 text-xs" style={{ color: UI.text.muted }}>
          {formatAppointmentDate(createdAt, i18n.language)}
        </Text>
      ) : null}
      {comment ? (
        <Text className="mt-2 text-sm leading-6" style={{ color: UI.text.secondary }}>
          {comment}
        </Text>
      ) : null}
    </View>
  );
}
