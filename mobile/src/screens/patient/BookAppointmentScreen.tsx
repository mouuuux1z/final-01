import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenShell } from '../../components/ui/ScreenShell';
import { BackButton } from '../../components/BackButton';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { UI } from '../../theme/ui';
import { api, getApiErrorMessage } from '../../services/api';
import { showAlert } from '../../utils/alert';
import { getDayChipLabels, getNextLocalDays, getAppointmentDateTime } from '../../utils/appointmentHelpers';
import { BOOKING_BLOCK_DAYS } from '../../constants/attendance';
import { useAuthStore } from '../../store/authStore';
import type { ApiResponse, DoctorAvailabilitySlot, PatientUser, Appointment } from '../../types';
import type { PatientStackParamList } from '../../navigation/PatientTabs';

type Props = NativeStackScreenProps<PatientStackParamList, 'BookAppointment'>;

export function BookAppointmentScreen({ navigation, route }: Props) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user) as PatientUser | null;
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const { doctorId, doctorName } = route.params;
  const isBookingBlocked =
    user?.bookingBlockedUntil != null && new Date(user.bookingBlockedUntil) > new Date();

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const dates = useMemo(() => getNextLocalDays(7, 0), []);
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const selectedDateLabels = useMemo(
    () => getDayChipLabels(selectedDate, t, i18n.language),
    [selectedDate, t, i18n.language],
  );

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ['availability', doctorId, selectedDate],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DoctorAvailabilitySlot[]>>(`/doctors/${doctorId}/availability`, {
        params: { date: selectedDate, availableOnly: true },
      });
      return data.data;
    },
  });

  const availableTimes = useMemo(() => {
    const now = new Date();
    return (slots ?? [])
      .filter(
        (slot) =>
          !slot.isBooked && getAppointmentDateTime(slot.date, slot.time) > now,
      )
      .map((slot) => slot.time)
      .sort((left, right) => left.localeCompare(right));
  }, [slots]);

  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTime) {
        throw new Error(t('appointments.selectTime'));
      }

      const { data } = await api.post<ApiResponse<Appointment>>('/appointments', {
        doctorId,
        date: selectedDate,
        time: selectedTime,
        notes: notes.trim() || undefined,
      });
      return data.data;
    },
    onSuccess: async (appointment) => {
      await queryClient.invalidateQueries({ queryKey: ['appointments'] });
      navigation.replace('BookingReceipt', { appointmentId: appointment.id });
    },
    onError: (error) => {
      void fetchProfile();
      showAlert(t('common.error'), getApiErrorMessage(error));
    },
  });

  return (
    <ScreenShell contentContainerClassName="pb-8">
        <BackButton onPress={() => navigation.goBack()} />
        <Text className="mb-2 text-2xl font-bold text-on-sky">{t('appointments.book')}</Text>
        <Text className="mb-6 text-base text-on-sky-muted">
          {t('appointments.with', { name: doctorName })}
        </Text>

        {isBookingBlocked ? (
          <View className="mb-6 rounded-card border border-red-200 bg-red-50 px-4 py-4">
            <Text className="text-sm font-semibold text-red-700">{t('profile.bookingBlockedTitle')}</Text>
            <Text className="mt-1 text-sm leading-6 text-red-600">
              {t('profile.bookingBlockedMessage', {
                date: new Date(user!.bookingBlockedUntil!).toLocaleDateString(),
                days: BOOKING_BLOCK_DAYS,
              })}
            </Text>
          </View>
        ) : null}

        <Text className="mb-3 text-sm font-semibold text-on-sky">{t('appointments.selectDate')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          {dates.map((date) => {
            const labels = getDayChipLabels(date, t, i18n.language);
            return (
              <Pressable
                key={date}
                onPress={() => {
                  setSelectedDate(date);
                  setSelectedTime(null);
                }}
                className={`mr-2 min-w-[72px] items-center rounded-card px-4 py-3 ${selectedDate === date ? 'bg-primary' : 'bg-white border border-slate-200'}`}
              >
                <Text className={`text-xs font-medium ${selectedDate === date ? 'text-white/80' : 'text-slate-500'}`}>
                  {labels.weekday}
                </Text>
                <Text className={`text-lg font-bold ${selectedDate === date ? 'text-white' : 'text-slate-900'}`}>
                  {labels.dayNumber}
                </Text>
                <Text className={`text-xs font-medium ${selectedDate === date ? 'text-white/80' : 'text-slate-500'}`}>
                  {labels.month}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text className="mb-3 text-sm font-semibold text-on-sky">{t('appointments.selectTime')}</Text>
        {slotsLoading ? (
          <ActivityIndicator color={UI.primary} className="mb-6" />
        ) : availableTimes.length === 0 ? (
          <Text className="mb-6 text-sm text-on-sky-muted">{t('doctor.noAvailableSlots')}</Text>
        ) : (
          <View className="mb-6 flex-row flex-wrap gap-2">
            {availableTimes.map((time) => (
              <Pressable
                key={time}
                onPress={() => setSelectedTime(time)}
                className={`rounded-btn px-4 py-2 ${selectedTime === time ? 'bg-primary' : 'bg-white border border-slate-200'}`}
              >
                <Text className={`text-sm font-medium ${selectedTime === time ? 'text-white' : 'text-slate-700'}`}>
                  {time}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <Input
          label={t('appointments.notes')}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          tone="onSky"
          className="min-h-[80px]"
        />

        <Card
          className="mb-6"
          subtitle={`${selectedDateLabels.weekday} ${selectedDateLabels.dayNumber} ${selectedDateLabels.month} · ${selectedTime ?? '—'}`}
          title={doctorName}
        />

        <Button
          title={t('appointments.confirmBooking')}
          loading={bookMutation.isPending}
          disabled={!selectedTime || isBookingBlocked}
          onPress={() => bookMutation.mutate()}
        />
    </ScreenShell>
  );
}
