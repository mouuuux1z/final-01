import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { AppIconName } from '../../components/AppIcon';
import { DoctorDashboardHeader } from '../../components/doctor/DoctorDashboardHeader';
import { DoctorStatCard } from '../../components/doctor/DoctorStatCard';
import { AppointmentAttendanceActions } from '../../components/doctor/AppointmentAttendanceActions';
import { Card } from '../../components/Card';
import { AppIcon } from '../../components/AppIcon';
import { AppointmentCardHeader } from '../../components/AppointmentCardHeader';
import { isActiveQueueAppointment, sortAppointmentsByQueue } from '../../constants/attendance';
import { useDoctorAttendanceMutation } from '../../hooks/useDoctorAttendanceMutation';
import { api } from '../../services/api';
import {
  getAppointmentDateKey,
  isAppointmentUpcoming,
  isDoctorQueueAppointment,
  toDateInputValue,
} from '../../utils/appointmentHelpers';
import { useAuthStore } from '../../store/authStore';
import { UI } from '../../theme/ui';
import { useNotificationStore } from '../../store/notificationStore';
import type { ApiResponse, Appointment, DoctorUser, PaginatedResponse } from '../../types';
import type { DoctorTabParamList } from '../../navigation/DoctorTabs';
import type { DoctorRootStackParamList } from '../../navigation/DoctorRootStack';

type Props = BottomTabScreenProps<DoctorTabParamList, 'Dashboard'>;

export function DoctorDashboardScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const rootNavigation = useNavigation<NativeStackNavigationProp<DoctorRootStackParamList>>();
  const user = useAuthStore((s) => s.user) as DoctorUser | null;
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const { mutation: attendanceMutation, markingId } = useDoctorAttendanceMutation();
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
            isActiveQueueAppointment(item.status) &&
            isDoctorQueueAppointment(item) &&
            isAppointmentUpcoming(item.date, item.time),
        ),
      ).slice(0, 10),
    [dashboardAppointments],
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

      <Pressable
        onPress={() => rootNavigation.navigate('LiveQueue')}
        className="mx-5 mt-4 overflow-hidden rounded-card border border-primary/20 bg-white active:opacity-90"
      >
        <View className="flex-row items-center px-4 py-4">
          <View className="mr-3 h-12 w-12 items-center justify-center rounded-btn bg-primary-light">
            <AppIcon name="patients" size={22} color={UI.primary} strokeWidth={2.25} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-slate-900">{t('queue.manageTitle')}</Text>
            <Text className="mt-0.5 text-sm text-slate-500">{t('queue.dashboardHint')}</Text>
          </View>
          <AppIcon name="back" size={18} color="#94A3B8" strokeWidth={2} style={{ transform: [{ scaleX: -1 }] }} />
        </View>
      </Pressable>

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
