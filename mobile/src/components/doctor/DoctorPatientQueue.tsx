import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../AppIcon';
import {
  attendanceColor,
  attendanceLabelKey,
  formatAppointmentDate,
  isDoctorQueueAppointment,
} from '../../utils/appointmentHelpers';
import { AppointmentAttendanceActions } from './AppointmentAttendanceActions';
import type { Appointment, AttendanceStatus } from '../../types';
import { UI } from '../../theme/ui';

interface DoctorPatientQueueProps {
  appointments: Appointment[];
  loading?: boolean;
  onMarkAttendance: (id: string, status: AttendanceStatus) => void;
  markingId?: string | null;
  onOpenChat?: (patient: { id: string; name: string }) => void;
}

function getNextQueueIndex(appointments: Appointment[]): number {
  return appointments.findIndex((apt) => isDoctorQueueAppointment(apt));
}

export function DoctorPatientQueue({
  appointments,
  loading,
  onMarkAttendance,
  markingId,
  onOpenChat,
}: DoctorPatientQueueProps) {
  const { t, i18n } = useTranslation();
  const nextIndex = getNextQueueIndex(appointments);

  if (loading) {
    return (
      <View className="items-center py-10">
        <ActivityIndicator color={UI.primary} />
      </View>
    );
  }

  if (appointments.length === 0) {
    return (
      <View className="rounded-card border border-dashed border-slate-200 bg-white px-4 py-8">
        <Text className="text-center text-slate-500">{t('doctor.noQueueToday')}</Text>
      </View>
    );
  }

  return (
    <View className="gap-3">
      {appointments.map((apt, index) => {
        const queueNumber = index + 1;
        const isNext = index === nextIndex;
        const patientName = apt.patient?.name ?? apt.patientName ?? t('doctor.unknownPatient');

        return (
          <View
            key={apt.id}
            className={`overflow-hidden rounded-card border bg-white ${
              isNext ? 'border-primary shadow-sm' : 'border-slate-100'
            }`}
          >
            {isNext ? (
              <View className="bg-primary px-4 py-1.5">
                <Text className="text-xs font-semibold text-white">{t('doctor.nextAppointment')}</Text>
              </View>
            ) : null}

            <View className="flex-row items-start gap-3 p-4">
              <View
                className={`h-12 w-12 items-center justify-center rounded-card ${
                  isNext ? 'bg-primary' : 'bg-slate-100'
                }`}
              >
                <Text className={`text-lg font-bold ${isNext ? 'text-white' : 'text-slate-700'}`}>{queueNumber}</Text>
              </View>

              <View className="flex-1">
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1">
                    <Text className="text-base font-bold text-slate-900">{patientName}</Text>
                    <View className="mt-2 gap-1.5">
                      <View className="flex-row items-center gap-2">
                        <View className="h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                          <AppIcon name="calendar" size={14} color="#64748B" strokeWidth={2.25} />
                        </View>
                        <Text className="text-sm font-medium text-slate-600">
                          {formatAppointmentDate(apt.date, i18n.language)}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <View className="h-7 w-7 items-center justify-center rounded-lg bg-primary-light">
                          <AppIcon name="clock" size={14} color={UI.primary} strokeWidth={2.5} />
                        </View>
                        <Text className="text-sm font-bold text-primary">{apt.time}</Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-2">
                    {apt.patient?.id && onOpenChat ? (
                      <Pressable
                        onPress={() =>
                          onOpenChat({ id: apt.patient!.id, name: patientName })
                        }
                        accessibilityLabel={t('chat.message')}
                        className="h-10 w-10 items-center justify-center rounded-btn bg-primary-light active:opacity-80"
                      >
                        <AppIcon name="messages" size={20} color={UI.primary} strokeWidth={2.25} />
                      </Pressable>
                    ) : null}

                    <View
                      className="rounded-full px-2.5 py-1"
                      style={{ backgroundColor: `${attendanceColor(apt.attendanceStatus)}18` }}
                    >
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: attendanceColor(apt.attendanceStatus) }}
                    >
                      {apt.attendanceStatus === 'ATTENDED'
                        ? '✅'
                        : apt.attendanceStatus === 'ABSENT'
                          ? '❌'
                          : '⏳'}{' '}
                      {t(attendanceLabelKey(apt.attendanceStatus, { date: apt.date, time: apt.time }))}
                    </Text>
                  </View>
                  </View>
                </View>

                <AppointmentAttendanceActions
                  appointment={apt}
                  markingId={markingId}
                  onMarkAttendance={onMarkAttendance}
                  variant="queue"
                />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}
