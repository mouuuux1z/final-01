import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../Button';
import { Input } from '../Input';
import { TopErrorBanner } from '../TopErrorBanner';
import { getApiErrorMessage } from '../../services/api';
import { submitDoctorRating } from '../../services/ratingsApi';
import { showAlert } from '../../utils/alert';
import { StarRatingInput } from './StarRatingInput';
import { UI } from '../../theme/ui';
import type { DoctorRating } from '../../types';

interface DoctorReviewFormProps {
  doctorId: string;
  eligible: boolean;
  existingRating?: DoctorRating | null;
  onSuccess?: () => void;
}

export function DoctorReviewForm({ doctorId, eligible, existingRating, onSuccess }: DoctorReviewFormProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (existingRating) {
      setRating(existingRating.rating);
      setComment(existingRating.comment ?? '');
    } else {
      setRating(0);
      setComment('');
    }
  }, [existingRating]);

  const submitMutation = useMutation({
    mutationFn: () => submitDoctorRating(doctorId, { rating, comment: comment.trim() || undefined }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['doctor-rating-me', doctorId] });
      void queryClient.invalidateQueries({ queryKey: ['doctor', doctorId] });
      void queryClient.invalidateQueries({ queryKey: ['doctor-ratings', doctorId] });
      void queryClient.invalidateQueries({ queryKey: ['doctors'] });
      showAlert(t('common.success'), t('ratings.thankYou'));
      onSuccess?.();
    },
    onError: (error) => setFormError(getApiErrorMessage(error)),
  });

  if (!eligible) {
    return (
      <Text className="text-center text-sm leading-6" style={{ color: UI.text.secondary }}>
        {t('ratings.mustCompleteAppointment')}
      </Text>
    );
  }

  const isEditing = Boolean(existingRating);

  return (
    <View>
      {formError ? <TopErrorBanner message={formError} onDismiss={() => setFormError(null)} /> : null}

      <View className="mb-4">
        <StarRatingInput value={rating} onChange={setRating} size={32} />
      </View>

      <Input
        label={t('ratings.commentLabel')}
        placeholder={t('ratings.addReviewPlaceholder')}
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        className="min-h-[100px]"
      />

      <Button
        title={isEditing ? t('ratings.update') : t('ratings.submit')}
        onPress={() => {
          if (rating < 1) {
            setFormError(t('ratings.selectStars'));
            return;
          }
          setFormError(null);
          submitMutation.mutate();
        }}
        loading={submitMutation.isPending}
        disabled={rating < 1}
      />
    </View>
  );
}
