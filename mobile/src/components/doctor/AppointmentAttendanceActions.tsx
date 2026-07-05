import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ATTENDANCE_COMMITMENT_MAX, normalizeCommitmentPoints } from '../../constants/attendance';
import { isAttendanceMarkingAvailable } from '../../utils/appointmentHelpers';
import type { Appointment, AttendanceStatus } from '../../types';

interface AppointmentAttendanceActionsProps {
  appointment: Appointment;
  markingId?: string | null;
  onMarkAttendance: (id: string, status: AttendanceStatus) => void;
  variant?: 'card' | 'queue';
}

export function AppointmentAttendanceActions({
  appointment,
  markingId,
  onMarkAttendance,
  variant = 'card',
}: AppointmentAttendanceActionsProps) {
  const { t } = useTranslation();
  const isPending =
    appointment.attendanceStatus === 'PENDING' || appointment.attendanceStatus === 'LATE';
  const canMark =
    isPending && isAttendanceMarkingAvailable(appointment.date, appointment.time);
  const isMarking = markingId === appointment.id;
  const commitmentPoints = normalizeCommitmentPoints(appointment.patient?.attendancePoints);

  const attendedClassName =
    variant === 'queue'
      ? 'flex-1 flex-row items-center justify-center gap-1 rounded-btn bg-green-50 py-2.5'
      : 'flex-1 rounded-btn bg-success py-2.5';
  const absentClassName =
    variant === 'queue'
      ? 'flex-1 flex-row items-center justify-center gap-1 rounded-btn bg-red-50 py-2.5'
      : 'flex-1 rounded-btn bg-error py-2.5';
  const attendedTextClassName =
    variant === 'queue' ? 'text-sm font-semibold text-green-700' : 'text-center text-sm font-semibold text-white';
  const absentTextClassName =
    variant === 'queue' ? 'text-sm font-semibold text-red-600' : 'text-center text-sm font-semibold text-white';

  return (
    <>
      {appointment.patientId ? (
        <Text className="mt-2 text-xs font-medium text-slate-500">
          {t('doctor.commitmentBalance', { current: commitmentPoints, max: ATTENDANCE_COMMITMENT_MAX })}
        </Text>
      ) : null}

      {isPending ? (
        <>
          {!canMark ? (
            <Text className="mt-3 text-xs text-slate-500">{t('doctor.attendanceAvailableAfter')}</Text>
          ) : null}
          <View className={variant === 'queue' ? 'mt-3 flex-row gap-2' : 'mt-3 flex-row gap-3'}>
            <Pressable
              disabled={!canMark || isMarking}
              onPress={() => onMarkAttendance(appointment.id, 'ATTENDED')}
              className={`${attendedClassName}${!canMark ? ' opacity-50' : ''}`}
            >
              {isMarking ? (
                <ActivityIndicator size="small" color={variant === 'queue' ? '#16A34A' : '#FFFFFF'} />
              ) : (
                <Text className={attendedTextClassName}>
                  ✅ {t('doctor.markAttended')}
                </Text>
              )}
            </Pressable>
            <Pressable
              disabled={!canMark || isMarking}
              onPress={() => onMarkAttendance(appointment.id, 'ABSENT')}
              className={`${absentClassName}${!canMark ? ' opacity-50' : ''}`}
            >
              {isMarking ? (
                <ActivityIndicator size="small" color={variant === 'queue' ? '#DC2626' : '#FFFFFF'} />
              ) : (
                <Text className={absentTextClassName}>
                  ❌ {t('doctor.markAbsent')}
                </Text>
              )}
            </Pressable>
          </View>
        </>
      ) : null}

      {appointment.attendanceStatus === 'ABSENT' && appointment.patientId ? (
        <>
          <Text className="mt-2 text-xs text-red-600">{t('doctor.commitmentDeducted')}</Text>
          {commitmentPoints === 0 ? (
            <Text className="mt-1 text-xs font-semibold text-red-700">{t('doctor.commitmentBlockedNotice')}</Text>
          ) : null}
        </>
      ) : null}
    </>
  );
}
