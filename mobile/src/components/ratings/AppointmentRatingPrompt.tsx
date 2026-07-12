import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StarRatingInput } from './StarRatingInput';
import { Button } from '../Button';
import { getApiErrorMessage } from '../../services/api';
import { getMyRatingForDoctor, submitDoctorRating } from '../../services/ratingsApi';
import { showAlert } from '../../utils/alert';
import { UI, cardShadowStyle } from '../../theme/ui';

interface AppointmentRatingPromptProps {
  doctorId: string;
  doctorName: string;
  variant?: 'card' | 'button';
  onRated?: () => void;
}

export function AppointmentRatingPrompt({
  doctorId,
  doctorName,
  variant = 'card',
  onRated,
}: AppointmentRatingPromptProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['doctor-rating-me', doctorId],
    queryFn: () => getMyRatingForDoctor(doctorId),
    enabled: variant === 'card' || expanded,
    retry: 1,
  });

  useEffect(() => {
    if (data?.rating) {
      setRating(data.rating.rating);
    }
  }, [data?.rating]);

  const submitMutation = useMutation({
    mutationFn: () => submitDoctorRating(doctorId, { rating }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['doctor-rating-me', doctorId] });
      void queryClient.invalidateQueries({ queryKey: ['doctors'] });
      void queryClient.invalidateQueries({ queryKey: ['doctor', doctorId] });
      showAlert(t('common.success'), t('ratings.thankYou'));
      setExpanded(false);
      onRated?.();
    },
    onError: (error) => showAlert(t('common.error'), getApiErrorMessage(error)),
  });

  if (variant === 'button' && !expanded) {
    return (
      <View className="mt-3">
        <Button
          title={t('ratings.rateDoctor')}
          onPress={() => setExpanded(true)}
        />
      </View>
    );
  }

  if (isLoading || !data?.eligible) {
    return null;
  }

  const submit = () => {
    if (rating < 1) {
      showAlert(t('common.error'), t('ratings.selectStars'));
      return;
    }
    submitMutation.mutate();
  };

  if (variant === 'button' && expanded) {
    return (
      <View className="rounded-card bg-medical-card p-4" style={cardShadowStyle()}>
        <Text className="mb-1 text-sm font-semibold" style={{ color: UI.text.primary }}>
          {t('ratings.rateDoctor')}
        </Text>
        <Text className="mb-4 text-sm" style={{ color: UI.text.secondary }}>
          {doctorName}
        </Text>
        <StarRatingInput value={rating} onChange={setRating} size={32} />
        <View className="mt-4 flex-row gap-2">
          <View className="flex-1">
            <Button
              title={data.rating ? t('ratings.update') : t('ratings.submit')}
              onPress={submit}
              loading={submitMutation.isPending}
              disabled={rating < 1}
            />
          </View>
          <Pressable
            onPress={() => setExpanded(false)}
            className="items-center justify-center rounded-btn px-4 active:opacity-80"
            style={{ backgroundColor: UI.input }}
          >
            <Text className="text-sm font-semibold" style={{ color: UI.text.secondary }}>
              {t('common.cancel')}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View
      className="mt-3 rounded-card border bg-amber-50/80 p-4"
      style={{ borderColor: '#FDE68A', ...cardShadowStyle() }}
    >
      <Text className="mb-3 text-sm font-semibold" style={{ color: '#92400E' }}>
        {data.rating ? t('ratings.editRating') : t('ratings.rateDoctor')}
      </Text>
      <StarRatingInput value={rating} onChange={setRating} size={28} />
      <View className="mt-3">
        <Button
          title={data.rating ? t('ratings.update') : t('ratings.submit')}
          onPress={submit}
          loading={submitMutation.isPending}
          disabled={rating < 1}
        />
      </View>
    </View>
  );
}
