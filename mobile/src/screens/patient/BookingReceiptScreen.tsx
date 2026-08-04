import { Text, View } from 'react-native';
import { AppLoader } from '../../components/AppLoader';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookingReceiptCard } from '../../components/appointments/BookingReceiptCard';
import { LiveQueueTrackingCard } from '../../components/appointments/LiveQueueTrackingCard';
import { AppointmentRatingPrompt } from '../../components/ratings/AppointmentRatingPrompt';
import { Button } from '../../components/Button';
import { ScreenShell } from '../../components/ui/ScreenShell';
import { UI } from '../../theme/ui';
import { api } from '../../services/api';
import type { ApiResponse, Appointment } from '../../types';
import type { PatientStackParamList } from '../../navigation/PatientTabs';

type Props = NativeStackScreenProps<PatientStackParamList, 'BookingReceipt'>;

export function BookingReceiptScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { appointmentId } = route.params;

  const { data: appointment, isLoading, isError } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Appointment>>(`/appointments/${appointmentId}`);
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <ScreenShell contentContainerClassName="flex-1 items-center justify-center">
        <AppLoader color={UI.primary} size="large" />
      </ScreenShell>
    );
  }

  if (isError || !appointment) {
    return (
      <ScreenShell contentContainerClassName="pb-8">
        <Text className="mb-4 text-center text-base" style={{ color: UI.text.secondary }}>
          {t('appointments.receiptLoadError')}
        </Text>
        <Button title={t('appointments.viewAppointments')} onPress={() => navigation.navigate('MainTabs', { screen: 'Appointments' })} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell contentContainerClassName="pb-8">
      <LiveQueueTrackingCard appointment={appointment} />
      <BookingReceiptCard appointment={appointment} />

      {appointment.status === 'COMPLETED' && appointment.doctor?.id ? (
        <View className="mt-6">
          <AppointmentRatingPrompt
            doctorId={appointment.doctor.id}
            doctorName={appointment.doctor.name ?? t('chat.doctor')}
            variant="button"
          />
        </View>
      ) : null}

      <View className="mt-6 gap-3">
        <Button
          title={t('appointments.viewAppointments')}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Appointments' })}
        />
        <Button
          title={t('appointments.backToHome')}
          variant="outline"
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        />
      </View>
    </ScreenShell>
  );
}
