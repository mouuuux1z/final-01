import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { AppIconName } from '../../components/AppIcon';
import { DoctorDashboardHeader } from '../../components/doctor/DoctorDashboardHeader';
import { DoctorStatCard } from '../../components/doctor/DoctorStatCard';
import { AppointmentAttendanceActions } from '../../components/doctor/AppointmentAttendanceActions';
import { Card } from '../../components/Card';
import { AppointmentCardHeader } from '../../components/AppointmentCardHeader';
import { isActiveQueueAppointment, sortAppointmentsByQueue } from '../../constants/attendance';
import { api, getApiErrorMessage } from '../../services/api';
import { showAlert } from '../../utils/alert';
import {
  getAppointmentDateKey,
  isAppointmentUpcoming,
  toDateInputValue,
} from '../../utils/appointmentHelpers';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import type { ApiResponse, Appointment, AttendanceStatus, DoctorUser, PaginatedResponse } from '../../types';
import type { DoctorTabParamList } from '../../navigation/DoctorTabs';
import type { DoctorRootStackParamList } from '../../navigation/DoctorRootStack';

type Props = BottomTabScreenProps<DoctorTabParamList, 'Dashboard'>;

export function DoctorDashboardScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const rootNavigation = useNavigation<NativeStackNavigationProp<DoctorRootStackParamList>>();
  const user = useAuthStore((s) => s.user) as DoctorUser | null;
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const today = toDateInputValue();

  const { data: dashboardAppointments, isError, refetch } = useQuery({
    queryKey: ['appointments', 'doctor-dashboard', user?.id, today],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedResponse<Appointment>>>('/appointments', {
        params: {
          from: today,
          statuses: 'PENDING,CONFIRMED',
          sort: 'asc',
          limit: 100,
        },
      });
      return data.data?.items ?? [];
    },
    enabled: !!user?.id,
    staleTime: 60_000,
    retry: 1,
  });

  const todayAppointments = useMemo(
    () =>
      (dashboardAppointments ?? []).filter(
        (item) => getAppointmentDateKey(item.date) === today && isActiveQueueAppointment(item.status),
      ),
    [dashboardAppointments, today],
  );

  const upcomingAppointments = useMemo(
    () =>
      sortAppointmentsByQueue(
        (dashboardAppointments ?? []).filter(
          (item) =>
            getAppointmentDateKey(item.date) > today &&
            isActiveQueueAppointment(item.status) &&
            isAppointmentUpcoming(item.date, item.time),
        ),
      ).slice(0, 10),
    [dashboardAppointments, today],
  );

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredUpcoming = useMemo(() => {
    const items = upcomingAppointments ?? [];
    if (!normalizedSearch) return items;
    return items.filter((appointment) => {
      const patientName = (appointment.patient?.name ?? appointment.patientName ?? '').toLowerCase();
      return patientName.includes(normalizedSearch);
    });
  }, [upcomingAppointments, normalizedSearch]);

  const todayStats = useMemo(() => todayAppointments ?? [], [todayAppointments]);

  const attendedCount = todayStats.filter((a) => a.attendanceStatus === 'ATTENDED').length;
  const absentCount = todayStats.filter((a) => a.attendanceStatus === 'ABSENT').length;
  const todayCount = todayStats.length;
  const upcomingCount = upcomingAppointments?.length ?? 0;

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

  const stats: {
    label: string;
    value: number | string;
    icon: AppIconName;
    tone: 'primary' | 'success' | 'danger' | 'info';
  }[] = [
    { label: t('doctor.todayAppointments'), value: todayCount, icon: 'calendar', tone: 'primary' },
    { label: t('doctor.attendedToday'), value: attendedCount, icon: 'check', tone: 'success' },
    { label: t('doctor.absentToday'), value: absentCount, icon: 'patients', tone: 'danger' },
    { label: t('doctor.upcomingAppointments'), value: upcomingCount, icon: 'schedule', tone: 'info' },
  ];

  return (
    <ScrollView className="flex-1" contentContainerClassName="pb-10">
      <DoctorDashboardHeader
        user={user}
        unreadCount={unreadCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onProfilePress={() => navigation.navigate('Settings')}
        onNotificationsPress={() => navigation.navigate('Appointments')}
      />

      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statsCell}>
              <DoctorStatCard
                value={stat.value}
                label={stat.label}
                icon={stat.icon}
                tone={stat.tone}
              />
            </View>
          ))}
        </View>
      </View>

      <View className="mt-6 px-5">
        <Text className="mb-1 text-lg font-semibold text-on-sky">{t('doctor.upcomingAppointments')}</Text>
        <Text className="mb-4 text-sm text-on-sky-muted">{t('doctor.upcomingAppointmentsHint')}</Text>

        {isError ? (
          <View className="rounded-card border border-dashed border-slate-200 bg-white px-4 py-8">
            <Text className="mb-3 text-center text-slate-500">{t('common.error')}</Text>
            <Text className="text-center text-primary" onPress={() => void refetch()}>
              {t('common.retry')}
            </Text>
          </View>
        ) : filteredUpcoming.length === 0 ? (
          <View className="rounded-card border border-dashed border-slate-200 bg-white px-4 py-8">
            <Text className="text-center text-slate-500">
              {normalizedSearch ? t('doctor.noSearchResults') : t('doctor.noUpcomingAppointments')}
            </Text>
          </View>
        ) : (
          filteredUpcoming.map((item, index) => {
            const patientId = item.patient?.id;
            const patientName = item.patient?.name ?? item.patientName ?? t('doctor.unknownPatient');

            return (
              <Card key={item.id} className="mb-3">
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
                <AppointmentAttendanceActions
                  appointment={item}
                  markingId={markingId}
                  onMarkAttendance={(id, attendanceStatus) =>
                    attendanceMutation.mutate({ id, attendanceStatus })
                  }
                />
              </Card>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statsSection: {
    marginTop: 16,
    paddingBottom: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
  },
  statsCell: {
    width: '47.5%',
    minWidth: 0,
    flexGrow: 1,
  },
});
