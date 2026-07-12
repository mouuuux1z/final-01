import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../Button';
import { Card } from '../Card';
import { AppointmentCardHeader } from '../AppointmentCardHeader';
import { ManualBookingModal } from './ManualBookingModal';
import { AppointmentAttendanceActions } from './AppointmentAttendanceActions';
import { getApiErrorMessage } from '../../services/api';
import { showAlert } from '../../utils/alert';
import { UI } from '../../theme/ui';
import {
  attendanceColor,
  attendanceLabelKey,
  getAppointmentDateTime,
  toDateInputValue,
} from '../../utils/appointmentHelpers';
import type { Appointment, AttendanceStatus, DoctorAvailabilitySlot } from '../../types';
import type { DoctorWorkspaceApi } from '../../services/doctorWorkspaceApi';

interface DoctorAppointmentsPanelProps {
  workspaceApi: DoctorWorkspaceApi;
  queryKeyPrefix: readonly unknown[];
  onOpenChat?: (patient: { id: string; name: string }) => void;
}

export function DoctorAppointmentsPanel({
  workspaceApi,
  queryKeyPrefix,
  onOpenChat,
}: DoctorAppointmentsPanelProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [manualBookingVisible, setManualBookingVisible] = useState(false);

  const bookingRange = useMemo(() => {
    const from = toDateInputValue();
    const end = new Date();
    end.setDate(end.getDate() + 30);
    return { from, to: toDateInputValue(end) };
  }, [manualBookingVisible]);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: [...queryKeyPrefix, 'appointments'],
    queryFn: () => workspaceApi.listAppointments({ limit: 100 }),
    retry: 1,
  });

  const { data: availableSlots = [], isLoading: slotsLoading } = useQuery({
    queryKey: [...queryKeyPrefix, 'availability', 'manual-booking', bookingRange.from, bookingRange.to],
    queryFn: () =>
      workspaceApi.listAvailability({
        from: bookingRange.from,
        to: bookingRange.to,
        availableOnly: true,
      }),
    enabled: manualBookingVisible,
  });

  const bookableSlots = useMemo(() => {
    const now = new Date();
    return (availableSlots as DoctorAvailabilitySlot[]).filter(
      (slot) => !slot.isBooked && getAppointmentDateTime(slot.date, slot.time) > now,
    );
  }, [availableSlots]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [...queryKeyPrefix, 'appointments'] });
    void queryClient.invalidateQueries({ queryKey: [...queryKeyPrefix, 'availability'] });
  };

  const attendanceMutation = useMutation({
    mutationFn: ({ id, attendanceStatus }: { id: string; attendanceStatus: AttendanceStatus }) =>
      workspaceApi.markAttendance(id, attendanceStatus),
    onSuccess: invalidate,
    onError: (error) => showAlert(t('common.error'), getApiErrorMessage(error)),
  });

  const manualBookMutation = useMutation({
    mutationFn: (payload: Parameters<DoctorWorkspaceApi['manualBook']>[0]) => workspaceApi.manualBook(payload),
    onSuccess: () => {
      setManualBookingVisible(false);
      invalidate();
      showAlert(t('common.success'), t('doctor.manualBookingSuccess'));
    },
    onError: (error) => showAlert(t('common.error'), getApiErrorMessage(error)),
  });

  const bookedAppointments = (data ?? []).filter((item: Appointment) => !['REJECTED', 'CANCELLED'].includes(item.status));

  if (isLoading) {
    return <ActivityIndicator className="my-10" color={UI.primary} />;
  }

  if (isError) {
    return (
      <View className="mt-10 items-center px-6">
        <Text className="mb-3 text-slate-500">{t('common.error')}</Text>
        <Button title={t('common.retry')} onPress={() => void refetch()} />
      </View>
    );
  }

  return (
    <>
      <FlatList
        style={{ flex: 1 }}
        data={bookedAppointments}
        keyExtractor={(item) => item.id}
        refreshing={isRefetching}
        onRefresh={() => void refetch()}
        contentContainerClassName="px-6 pb-10"
        ListHeaderComponent={
          <Button
            title={t('doctor.addManualBooking')}
            onPress={() => setManualBookingVisible(true)}
            className="mb-4"
          />
        }
      ListEmptyComponent={
        <View className="mt-10 items-center">
          <Text className="text-slate-500">{t('doctor.noAppointments')}</Text>
        </View>
      }
      renderItem={({ item, index }) => {
          const patientId = item.patient?.id;
          const patientName = item.patient?.name ?? item.patientName ?? t('doctor.unknownPatient');

          return (
          <Card className="mb-3">
            <AppointmentCardHeader
              index={index + 1}
              title={patientName}
              date={item.date}
              time={item.time}
              chatLabel={t('chat.message')}
              onChatPress={
                patientId && onOpenChat
                  ? () => onOpenChat({ id: patientId, name: patientName })
                  : undefined
              }
            />
            {item.attendanceStatus !== 'PENDING' ? (
              <View className="mt-2 flex-row flex-wrap gap-2">
                <View className="rounded-full px-3 py-1" style={{ backgroundColor: `${attendanceColor(item.attendanceStatus)}20` }}>
                  <Text className="text-xs font-semibold" style={{ color: attendanceColor(item.attendanceStatus) }}>
                    {t(attendanceLabelKey(item.attendanceStatus, { date: item.date, time: item.time }))}
                  </Text>
                </View>
              </View>
            ) : null}

            <AppointmentAttendanceActions
              appointment={item}
              onMarkAttendance={(id, attendanceStatus) =>
                attendanceMutation.mutate({ id, attendanceStatus })
              }
            />
          </Card>
          );
        }}
      />

      <ManualBookingModal
        visible={manualBookingVisible}
        onClose={() => setManualBookingVisible(false)}
        slots={bookableSlots}
        slotsLoading={slotsLoading}
        loading={manualBookMutation.isPending}
        onSubmit={async (payload) => {
          await manualBookMutation.mutateAsync(payload);
        }}
      />
    </>
  );
}
