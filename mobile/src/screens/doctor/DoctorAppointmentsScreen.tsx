import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Card } from '../../components/Card';
import { AppointmentCardHeader } from '../../components/AppointmentCardHeader';
import { AppointmentAttendanceActions } from '../../components/doctor/AppointmentAttendanceActions';
import { api, getApiErrorMessage } from '../../services/api';
import { showAlert } from '../../utils/alert';
import {
  attendanceColor,
  attendanceLabelKey,
  isDoctorQueueAppointment,
} from '../../utils/appointmentHelpers';
import type { ApiResponse, Appointment, AttendanceStatus, PaginatedResponse } from '../../types';
import type { DoctorTabParamList } from '../../navigation/DoctorTabs';
import type { DoctorRootStackParamList } from '../../navigation/DoctorRootStack';
import { UI } from '../../theme/ui';

type Props = BottomTabScreenProps<DoctorTabParamList, 'Appointments'>;

export function DoctorAppointmentsScreen(_props: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const rootNavigation = useNavigation<NativeStackNavigationProp<DoctorRootStackParamList>>();
  const [markingId, setMarkingId] = useState<string | null>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['appointments', 'doctor'],
    queryFn: async () => {
      const { data: response } = await api.get<ApiResponse<PaginatedResponse<Appointment>>>('/appointments', {
        params: { limit: 100 },
      });
      return response.data.items;
    },
  });

  const attendanceMutation = useMutation({
    mutationFn: ({ id, attendanceStatus }: { id: string; attendanceStatus: AttendanceStatus }) =>
      api.patch(`/appointments/${id}/attendance`, { attendanceStatus }),
    onMutate: ({ id }) => setMarkingId(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => showAlert(t('common.error'), getApiErrorMessage(error)),
    onSettled: () => setMarkingId(null),
  });

  const queueAppointments = (data ?? []).filter(
    (item) => !['REJECTED', 'CANCELLED'].includes(item.status) && isDoctorQueueAppointment(item),
  );

  return (
    <View className="flex-1 pt-14">
      <View className="px-6">
        <Text className="mb-1 text-3xl font-bold text-slate-900">{t('doctor.appointments')}</Text>
        <Text className="mb-6 text-base text-slate-500">{t('doctor.appointmentsHint')}</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-10" color={UI.primary} />
      ) : (
        <FlatList
          data={queueAppointments}
          keyExtractor={(item) => item.id}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          contentContainerClassName="px-6 pb-10"
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
                    patientId
                      ? () => rootNavigation.navigate('Chat', { patientId, patientName })
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

                {item.patientPhone || item.patient?.phone ? (
                  <Text className="mt-2 text-sm text-slate-500">
                    {t('auth.phone')}: {item.patientPhone ?? item.patient?.phone}
                  </Text>
                ) : null}

                {item.notes ? <Text className="mt-2 text-sm text-slate-500">{item.notes}</Text> : null}

                <AppointmentAttendanceActions
                  appointment={item}
                  markingId={markingId}
                  onMarkAttendance={(id, attendanceStatus) =>
                    attendanceMutation.mutate({ id, attendanceStatus })
                  }
                />
              </Card>
              );
            }}
        />
      )}
    </View>
  );
}
