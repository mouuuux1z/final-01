import { I18nManager, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { AppLoader } from '../AppLoader';
import { AppIcon } from '../AppIcon';
import { UI, cardShadowStyle } from '../../theme/ui';
import { getAppointmentQueueStatus, isQueueRouteNotFoundError } from '../../services/queueApi';
import { getApiErrorMessage } from '../../services/api';
import { getApiBaseOrigin } from '../../constants/config';
import { getAppointmentDateKey, getDayChipLabels, toDateInputValue } from '../../utils/appointmentHelpers';
import type { Appointment } from '../../types';

interface LiveQueueTrackingCardProps {
  appointment: Appointment;
}

export function LiveQueueTrackingCard({ appointment }: LiveQueueTrackingCardProps) {
  const { t, i18n } = useTranslation();
  const isRtl = I18nManager.isRTL || i18n.language === 'ar';
  const isToday = getAppointmentDateKey(appointment.date) === toDateInputValue();
  const canTrack =
    isToday &&
    !appointment.isPrivate &&
    !['CANCELLED', 'REJECTED', 'COMPLETED', 'NO_SHOW'].includes(appointment.status);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['appointment', appointment.id, 'queue'],
    queryFn: () => getAppointmentQueueStatus(appointment.id),
    enabled: canTrack,
    refetchInterval: canTrack ? 15_000 : false,
  });

  if (!canTrack) return null;

  if (isLoading) {
    return (
      <View className="mb-6 rounded-card border border-slate-200 bg-white p-5" style={cardShadowStyle()}>
        <AppLoader color={UI.primary} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="mb-6 rounded-card border border-slate-200 bg-white p-5" style={cardShadowStyle()}>
        <Text className="mb-2 text-base font-bold text-primary">{t('queue.liveTracking')}</Text>
        <Text className="mb-3 text-sm text-slate-600" style={{ textAlign: isRtl ? 'right' : 'left' }}>
          {isError
            ? isQueueRouteNotFoundError(error)
              ? t('errors.api.routeNotFound', { server: getApiBaseOrigin() })
              : getApiErrorMessage(error)
            : t('common.error')}
        </Text>
        <Pressable
          onPress={() => void refetch()}
          className="self-start rounded-btn border border-primary px-4 py-2 active:opacity-80"
        >
          <Text className="text-sm font-semibold text-primary">{t('common.retry')}</Text>
        </Pressable>
      </View>
    );
  }

  const showWaiting = data.isActive && !data.isCompleted && !data.isYourTurn && !data.isCancelled;
  const showYourTurn = data.isYourTurn;
  const showNotStarted = !data.isActive && !data.isCompleted;
  const showCompleted = data.isCompleted;

  const dateKey = getAppointmentDateKey(appointment.date);
  const dateLabels = getDayChipLabels(dateKey, t, i18n.language);

  return (
    <View className="mb-6 overflow-hidden rounded-card border border-primary/20 bg-white" style={cardShadowStyle()}>
      <View className="flex-row items-center gap-2 bg-primary-light px-5 py-3">
        <AppIcon name="patients" size={18} color={UI.primary} strokeWidth={2.25} />
        <Text className="text-base font-bold text-primary">{t('queue.liveTracking')}</Text>
      </View>

      <View className="gap-4 px-5 py-5">
        {data.clinicName ? (
          <View>
            <Text className="text-xs text-slate-500">{t('queue.clinic')}</Text>
            <Text className="text-sm font-semibold text-slate-900" style={{ textAlign: isRtl ? 'right' : 'left' }}>
              {data.clinicName}
            </Text>
          </View>
        ) : null}

        <View className="flex-row gap-3">
          <View className="flex-1 rounded-card bg-slate-50 px-4 py-3">
            <Text className="text-xs text-slate-500">{t('queue.yourNumber')}</Text>
            <Text className="mt-1 text-3xl font-bold text-primary">{data.queueNumber}</Text>
          </View>
          <View className="flex-1 rounded-card bg-slate-50 px-4 py-3">
            <Text className="text-xs text-slate-500">{t('queue.currentNumber')}</Text>
            <Text className="mt-1 text-3xl font-bold text-slate-900">
              {data.isActive || data.isCompleted ? data.currentNumber : '—'}
            </Text>
          </View>
        </View>

        {showNotStarted ? (
          <Text className="text-sm text-slate-600" style={{ textAlign: isRtl ? 'right' : 'left' }}>
            {t('queue.notStartedYet')}
          </Text>
        ) : null}

        {showWaiting ? (
          <View className="rounded-card bg-amber-50 px-4 py-3">
            <Text className="text-sm font-semibold text-amber-800" style={{ textAlign: isRtl ? 'right' : 'left' }}>
              {t('queue.patientsAhead', { count: data.patientsAhead })}
            </Text>
          </View>
        ) : null}

        {showYourTurn ? (
          <View className="rounded-card bg-green-50 px-4 py-3">
            <Text className="text-sm font-bold text-green-700" style={{ textAlign: isRtl ? 'right' : 'left' }}>
              {t('queue.yourTurnNow')}
            </Text>
          </View>
        ) : null}

        {showCompleted ? (
          <Text className="text-sm text-slate-600" style={{ textAlign: isRtl ? 'right' : 'left' }}>
            {t('queue.sessionCompleted')}
          </Text>
        ) : null}

        <Text className="text-xs text-slate-400" style={{ textAlign: isRtl ? 'right' : 'left' }}>
          {t('queue.updatedLive')} · {dateLabels.weekday} {dateLabels.dayNumber} {dateLabels.month} · {data.time}
        </Text>
      </View>
    </View>
  );
}
