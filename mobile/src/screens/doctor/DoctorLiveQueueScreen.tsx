import { I18nManager, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { DoctorRootStackParamList } from '../../navigation/DoctorRootStack';
import { AppIcon } from '../../components/AppIcon';
import { AppLoader } from '../../components/AppLoader';
import { Button } from '../../components/Button';
import { ScreenShell } from '../../components/ui/ScreenShell';
import { BackButton } from '../../components/BackButton';
import { UI, cardShadowStyle } from '../../theme/ui';
import { getApiBaseOrigin } from '../../constants/config';
import { getApiErrorMessage } from '../../services/api';
import {
  advanceDoctorQueue,
  getDoctorTodayQueue,
  isQueueRouteNotFoundError,
  startDoctorReception,
  type DoctorTodayQueue,
} from '../../services/queueApi';
import { showAlert } from '../../utils/alert';
import { getAppointmentDateKey } from '../../utils/appointmentHelpers';
import { toDateInputValue } from '../../utils/appointmentHelpers';
import type { Appointment } from '../../types';

function isActiveInQueue(appointment: Appointment): boolean {
  return !['CANCELLED', 'REJECTED'].includes(appointment.status);
}

function QueueAppointmentRow({
  appointment,
  currentNumber,
  isSessionActive,
}: {
  appointment: Appointment;
  currentNumber: number;
  isSessionActive: boolean;
}) {
  const { t } = useTranslation();
  const queueNumber = appointment.queueNumber ?? 0;
  const isCurrent = isSessionActive && queueNumber === currentNumber;
  const patientName = appointment.patient?.name ?? appointment.patientName ?? t('doctor.unknownPatient');
  const inactive = !isActiveInQueue(appointment);

  return (
    <View
      className={`mb-2 flex-row items-center rounded-card border px-4 py-3 ${isCurrent ? 'border-primary bg-primary-light' : 'border-slate-200 bg-white'}`}
      style={isCurrent ? undefined : cardShadowStyle()}
    >
      <View
        className={`mr-3 h-11 w-11 items-center justify-center rounded-card ${isCurrent ? 'bg-primary' : inactive ? 'bg-slate-100' : 'bg-slate-100'}`}
      >
        <Text className={`text-base font-bold ${isCurrent ? 'text-white' : inactive ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
          {queueNumber || '—'}
        </Text>
      </View>
      <View className="flex-1">
        <Text className={`text-base font-semibold ${inactive ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
          {patientName}
        </Text>
        <Text className="mt-0.5 text-sm text-slate-500">{appointment.time}</Text>
      </View>
      {isCurrent ? (
        <View className="rounded-full bg-primary px-2.5 py-1">
          <Text className="text-xs font-bold text-white">{t('queue.current')}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function DoctorLiveQueueScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<DoctorRootStackParamList>>();
  const isRtl = I18nManager.isRTL || i18n.language === 'ar';
  const queryClient = useQueryClient();
  const today = toDateInputValue();

  const { data, isLoading, refetch, isError, error } = useQuery({
    queryKey: ['doctor', 'queue', today],
    queryFn: getDoctorTodayQueue,
    refetchInterval: 30_000,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['doctor', 'queue'] });
  };

  const startMutation = useMutation({
    mutationFn: startDoctorReception,
    onSuccess: () => {
      invalidate();
      showAlert(t('common.success'), t('queue.receptionStarted'));
    },
    onError: (error) => showAlert(t('common.error'), getApiErrorMessage(error)),
  });

  const nextMutation = useMutation({
    mutationFn: advanceDoctorQueue,
    onSuccess: (result: DoctorTodayQueue) => {
      invalidate();
      if (result.session.isCompleted) {
        showAlert(t('common.success'), t('queue.allCompleted'));
      }
    },
    onError: (error) => showAlert(t('common.error'), getApiErrorMessage(error)),
  });

  const queue = data;
  const session = queue?.session;
  const todayAppointments = (queue?.appointments ?? []).filter(
    (item) => getAppointmentDateKey(item.date) === today,
  );
  const activeCount = todayAppointments.filter(isActiveInQueue).length;

  const queueErrorMessage = isError
    ? isQueueRouteNotFoundError(error)
      ? t('errors.api.routeNotFound', { server: getApiBaseOrigin() })
      : getApiErrorMessage(error)
    : '';

  const renderMainCard = () => {
    if (!session) return null;

    if (session.isCompleted) {
      return (
        <View className="mb-6 items-center rounded-card border border-green-200 bg-green-50 px-6 py-8">
          <AppIcon name="check" size={40} color="#16A34A" strokeWidth={2} />
          <Text className="mt-4 text-center text-lg font-bold text-green-800">{t('queue.allCompleted')}</Text>
        </View>
      );
    }

    if (!session.isActive) {
      return (
        <View className="mb-6 rounded-card border border-slate-200 bg-white px-6 py-8" style={cardShadowStyle()}>
          <Text className="mb-2 text-center text-lg font-bold text-slate-900">{t('queue.manageTitle')}</Text>
          <Text className="mb-6 text-center text-sm text-slate-500">{t('queue.manageHint')}</Text>
          <Button
            title={t('queue.startReception')}
            loading={startMutation.isPending}
            disabled={activeCount === 0}
            onPress={() => startMutation.mutate()}
          />
          {activeCount === 0 ? (
            <Text className="mt-4 text-center text-sm text-slate-500">{t('queue.noAppointmentsToday')}</Text>
          ) : null}
        </View>
      );
    }

    return (
      <View className="mb-6 overflow-hidden rounded-card border border-primary bg-white" style={cardShadowStyle()}>
        <View className="bg-primary px-6 py-8">
          <Text className="text-center text-sm font-medium text-blue-100">{t('queue.nowServing')}</Text>
          <Text className="mt-2 text-center text-5xl font-bold text-white">{session.currentNumber}</Text>
        </View>
        <View className="px-6 py-5">
          <Button
            title={t('queue.nextPatient')}
            loading={nextMutation.isPending}
            onPress={() => nextMutation.mutate()}
          />
        </View>
      </View>
    );
  };

  return (
    <ScreenShell contentContainerClassName="pb-10">
      <BackButton onPress={() => navigation.goBack()} />
      <Text className="mb-1 text-2xl font-bold text-on-sky" style={{ textAlign: isRtl ? 'right' : 'left' }}>
        {t('queue.manageTitle')}
      </Text>
      <Text className="mb-6 text-sm text-on-sky-muted" style={{ textAlign: isRtl ? 'right' : 'left' }}>
        {t('queue.manageSubtitle')}
      </Text>

      {isLoading ? (
        <AppLoader color={UI.primary} className="my-10" />
      ) : isError ? (
        <View className="items-center py-8">
          <Text className="mb-4 text-center text-sm text-slate-600">{queueErrorMessage}</Text>
          <Button title={t('common.retry')} variant="outline" onPress={() => void refetch()} />
        </View>
      ) : (
        <>
          {renderMainCard()}

          <Text className="mb-3 text-base font-semibold text-on-sky">{t('queue.todayList')}</Text>
          {todayAppointments.length === 0 ? (
            <Text className="text-sm text-on-sky-muted">{t('queue.noAppointmentsToday')}</Text>
          ) : (
            todayAppointments.map((appointment) => (
              <QueueAppointmentRow
                key={appointment.id}
                appointment={appointment}
                currentNumber={session?.currentNumber ?? 0}
                isSessionActive={Boolean(session?.isActive && !session?.isCompleted)}
              />
            ))
          )}
        </>
      )}
    </ScreenShell>
  );
}
