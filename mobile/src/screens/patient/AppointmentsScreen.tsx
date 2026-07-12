import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { AppIcon } from '../../components/AppIcon';
import { AppointmentRatingPrompt } from '../../components/ratings/AppointmentRatingPrompt';
import { ScreenShell } from '../../components/ui/ScreenShell';
import { UI, cardShadowStyle } from '../../theme/ui';
import { useTypography } from '../../hooks/useTypography';
import { api, getApiErrorMessage } from '../../services/api';
import { showAlert } from '../../utils/alert';
import { formatAppointmentDate, getAppointmentDateTime, isAppointmentPast, isAppointmentUpcoming, isTerminalAppointmentStatus, toDateInputValue } from '../../utils/appointmentHelpers';
import type { ApiResponse, Appointment, PaginatedResponse } from '../../types';
import type { PatientStackParamList, PatientTabParamList } from '../../navigation/PatientTabs';
import { useAuthStore } from '../../store/authStore';

type Props = BottomTabScreenProps<PatientTabParamList, 'Appointments'>;

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: '#FFF7ED', text: '#EA580C' },
  CONFIRMED: { bg: '#F0FDF4', text: '#16A34A' },
  CANCELLED: { bg: '#FEF2F2', text: '#DC2626' },
  COMPLETED: { bg: '#F1F5F9', text: '#64748B' },
  REJECTED: { bg: '#FEF2F2', text: '#DC2626' },
  NO_SHOW: { bg: '#FEF2F2', text: '#DC2626' },
};

export function AppointmentsScreen(_props: Props) {
  const { t, i18n } = useTranslation();
  const typography = useTypography();
  const queryClient = useQueryClient();
  const navigation = useNavigation<NativeStackNavigationProp<PatientStackParamList>>();
  const patientId = useAuthStore((s) => s.user?.id);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const today = toDateInputValue();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['appointments', tab, today],
    queryFn: async () => {
      const now = new Date();
      const params =
        tab === 'upcoming'
          ? { statuses: 'PENDING,CONFIRMED', from: today, sort: 'asc', limit: 30, page: 1 }
          : {
              statuses: 'COMPLETED,CANCELLED,NO_SHOW,REJECTED,PENDING,CONFIRMED',
              sort: 'desc',
              limit: 40,
              page: 1,
            };

      const { data: response } = await api.get<ApiResponse<PaginatedResponse<Appointment>>>('/appointments', {
        params,
      });
      const items = response.data?.items ?? [];

      if (tab === 'upcoming') {
        return items
          .filter((appointment) => isAppointmentUpcoming(appointment.date, appointment.time, now))
          .sort(
            (a, b) =>
              getAppointmentDateTime(a.date, a.time).getTime() - getAppointmentDateTime(b.date, b.time).getTime(),
          );
      }

      return items
        .filter((appointment) => {
          if (isTerminalAppointmentStatus(appointment.status)) return true;
          if (['PENDING', 'CONFIRMED'].includes(appointment.status)) {
            return !isAppointmentUpcoming(appointment.date, appointment.time, now);
          }
          return getAppointmentDateTime(appointment.date, appointment.time) < now;
        })
        .sort(
          (a, b) =>
            getAppointmentDateTime(b.date, b.time).getTime() - getAppointmentDateTime(a.date, a.time).getTime(),
        );
    },
    retry: 1,
    staleTime: 60_000,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.post(`/appointments/${id}/cancel`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['appointments'] }),
    onError: (error) => showAlert(t('common.error'), getApiErrorMessage(error)),
  });

  const openChat = (doctorId: string, doctorName: string) => {
    if (!patientId) return;
    navigation.navigate('PatientChat', { doctorId, patientId, doctorName });
  };

  return (
    <ScreenShell scroll={false}>
      <Text
        className="mb-6 text-2xl text-on-sky"
        style={{ fontFamily: typography.fontFamily, fontWeight: typography.headingWeight }}
      >
        {t('appointments.title')}
      </Text>

      <View className="mb-6 flex-row rounded-pill p-1.5" style={{ backgroundColor: UI.input }}>
        {(['upcoming', 'past'] as const).map((key) => (
          <Pressable
            key={key}
            onPress={() => setTab(key)}
            className="flex-1 rounded-pill py-3"
            style={tab === key ? { backgroundColor: UI.primary, ...cardShadowStyle() } : undefined}
          >
            <Text
              className="text-center text-sm font-semibold"
              style={{ color: tab === key ? '#FFFFFF' : UI.text.secondary }}
            >
              {t(`appointments.${key}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View className="mt-10 items-center">
          <ActivityIndicator color={UI.primary} />
          <Text className="mt-3 text-sm text-on-sky-muted">{t('common.loading')}</Text>
        </View>
      ) : isError ? (
        <View className="mt-10 items-center rounded-card bg-white p-8" style={{ borderColor: UI.border, borderWidth: 1 }}>
          <Text className="mb-3 text-center" style={{ color: UI.text.secondary }}>
            {t('common.error')}
          </Text>
          <Pressable onPress={() => void refetch()} className="rounded-pill px-4 py-2" style={{ backgroundColor: UI.primary }}>
            <Text className="text-sm font-semibold text-white">{t('common.retry')}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={data ?? []}
          keyExtractor={(item) => item.id}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
          ListEmptyComponent={
            <View className="mt-10 items-center rounded-card bg-white p-8" style={{ borderColor: UI.border, borderWidth: 1 }}>
              <AppIcon name="calendar" size={32} color={UI.text.muted} strokeWidth={1.75} />
              <Text className="mt-3 text-center" style={{ color: UI.text.secondary }}>{t('appointments.noAppointments')}</Text>
            </View>
          }
          renderItem={({ item }) => {
            const statusKey = (item.status ?? 'COMPLETED').toUpperCase();
            const status = STATUS_STYLE[statusKey] ?? STATUS_STYLE.COMPLETED;
            const awaitingDoctorConfirmation =
              ['PENDING', 'CONFIRMED'].includes(item.status) &&
              (item.attendanceStatus === 'PENDING' || item.attendanceStatus === 'LATE') &&
              isAppointmentPast(item.date, item.time);
            return (
              <View
                className="mb-3 rounded-card border bg-medical-card p-4"
                style={{ borderColor: UI.border, ...cardShadowStyle() }}
              >
                <View className="flex-row items-start gap-3">
                  <View className="h-11 w-11 items-center justify-center rounded-btn" style={{ backgroundColor: UI.primaryLight }}>
                    <AppIcon name="doctors" size={20} color={UI.primary} strokeWidth={2} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold" style={{ color: UI.text.primary }}>{item.doctor?.name ?? 'Doctor'}</Text>
                    <Text className="mt-0.5 text-sm" style={{ color: UI.text.secondary }}>
                      {formatAppointmentDate(item.date, i18n.language)} · {item.time}
                    </Text>
                    <View className="mt-2 self-start rounded-full px-3 py-1" style={{ backgroundColor: status.bg }}>
                      <Text className="text-xs font-semibold" style={{ color: status.text }}>
                        {t(`common.${statusKey.toLowerCase()}` as 'common.pending', {
                          defaultValue: item.status ?? statusKey,
                        })}
                      </Text>
                    </View>
                    {awaitingDoctorConfirmation ? (
                      <View className="mt-2 self-start rounded-full px-3 py-1" style={{ backgroundColor: '#FFF7ED' }}>
                        <Text className="text-xs font-semibold" style={{ color: '#EA580C' }}>
                          {t('appointments.awaitingDoctorConfirmation')}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                <View className="mt-3 flex-row items-center justify-end gap-2 border-t pt-3" style={{ borderColor: UI.border }}>
                  {['PENDING', 'CONFIRMED'].includes(statusKey) ? (
                    <Pressable
                      onPress={() => navigation.navigate('BookingReceipt', { appointmentId: item.id })}
                      className="rounded-lg px-3 py-1.5 active:opacity-80"
                      style={{ backgroundColor: UI.primaryLight }}
                    >
                      <Text className="text-sm font-semibold" style={{ color: UI.primary }}>
                        {t('appointments.viewReceipt')}
                      </Text>
                    </Pressable>
                  ) : null}
                  {item.doctor?.id && ['CONFIRMED', 'COMPLETED'].includes(statusKey) ? (
                    <Pressable
                      onPress={() => openChat(item.doctor!.id, item.doctor!.name ?? t('chat.doctor'))}
                      className="h-9 w-9 items-center justify-center rounded-lg active:opacity-80"
                      style={{ backgroundColor: UI.primaryLight }}
                    >
                      <AppIcon name="messages" size={18} color={UI.primary} strokeWidth={2.25} />
                    </Pressable>
                  ) : null}
                  {['PENDING', 'CONFIRMED'].includes(statusKey) ? (
                    <Pressable onPress={() => cancelMutation.mutate(item.id)} className="rounded-lg px-3 py-1.5 active:opacity-80" style={{ backgroundColor: '#FEF2F2' }}>
                      <Text className="text-sm font-semibold text-red-600">{t('appointments.cancelAppointment')}</Text>
                    </Pressable>
                  ) : null}
                </View>
                {statusKey === 'COMPLETED' && item.doctor?.id ? (
                  <AppointmentRatingPrompt
                    doctorId={item.doctor.id}
                    doctorName={item.doctor.name ?? t('chat.doctor')}
                    variant="button"
                  />
                ) : null}
              </View>
            );
          }}
        />
      )}
    </ScreenShell>
  );
}
