import { FlatList, Text, View } from 'react-native';
import { AppLoader } from '../../components/AppLoader';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Card } from '../../components/Card';
import { AppointmentCardHeader } from '../../components/AppointmentCardHeader';
import { AppointmentAttendanceActions } from '../../components/doctor/AppointmentAttendanceActions';
import { useDoctorAttendanceMutation } from '../../hooks/useDoctorAttendanceMutation';
import { api } from '../../services/api';
import {
  attendanceColor,
  attendanceLabelKey,
  isDoctorQueueAppointment,
} from '../../utils/appointmentHelpers';
import type { ApiResponse, Appointment, PaginatedResponse } from '../../types';
import type { DoctorTabParamList } from '../../navigation/DoctorTabs';
import type { DoctorRootStackParamList } from '../../navigation/DoctorRootStack';
import { UI } from '../../theme/ui';

type Props = BottomTabScreenProps<DoctorTabParamList, 'Appointments'>;

export function DoctorAppointmentsScreen(_props: Props) {
  const { t } = useTranslation();
  const rootNavigation = useNavigation<NativeStackNavigationProp<DoctorRootStackParamList>>();
  const { mutation: attendanceMutation, markingId } = useDoctorAttendanceMutation();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['appointments', 'doctor'],
    queryFn: async () => {
      const { data: response } = await api.get<ApiResponse<PaginatedResponse<Appointment>>>('/appointments', {
        params: { statuses: 'PENDING,CONFIRMED', sort: 'asc', limit: 50, page: 1 },
      });
      return response.data?.items ?? [];
    },
    select: (items) => items.filter(isDoctorQueueAppointment),
    staleTime: 60_000,
    retry: 1,
  });

  const queueAppointments = data ?? [];

  return (
    <View className="flex-1 pt-14">
      <View className="px-6">
        <Text className="mb-1 text-3xl font-bold text-on-sky">{t('doctor.appointments')}</Text>
        <Text className="mb-6 text-base text-on-sky-muted">{t('doctor.appointmentsHint')}</Text>
      </View>

      {isLoading ? (
        <View className="mt-10 items-center">
          <AppLoader />
          <Text className="mt-3 text-sm text-on-sky-muted">{t('common.loading')}</Text>
        </View>
      ) : isError ? (
        <View className="mt-10 items-center px-6">
          <Text className="mb-3 text-on-sky-muted">{t('common.error')}</Text>
          <Text className="text-primary" onPress={() => void refetch()}>
            {t('common.retry')}
          </Text>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={queueAppointments}
          keyExtractor={(item) => item.id}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 }}
          ListEmptyComponent={
            <View className="mt-10 items-center">
              <Text className="text-on-sky-muted">{t('doctor.noAppointments')}</Text>
            </View>
          }
          renderItem={({ item, index }) => {
              const patientId = item.patient?.id;
              const patientName = item.patient?.name ?? item.patientName ?? t('doctor.unknownPatient');

              return (
              <Card className="mb-3">
                <AppointmentCardHeader
                  queueNumber={item.queueNumber}
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
