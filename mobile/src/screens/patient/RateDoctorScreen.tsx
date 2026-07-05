import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackButton } from '../../components/BackButton';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { StarRatingInput } from '../../components/ratings/StarRatingInput';
import { ScreenShell } from '../../components/ui/ScreenShell';
import { TopErrorBanner } from '../../components/TopErrorBanner';
import { getApiErrorMessage } from '../../services/api';
import { getMyRatingForDoctor, submitDoctorRating } from '../../services/ratingsApi';
import { showAlert } from '../../utils/alert';
import { UI, cardShadowStyle } from '../../theme/ui';
import { useTypography } from '../../hooks/useTypography';
import type { PatientStackParamList } from '../../navigation/PatientTabs';

type Props = NativeStackScreenProps<PatientStackParamList, 'RateDoctor'>;

export function RateDoctorScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const typography = useTypography();
  const queryClient = useQueryClient();
  const { doctorId, doctorName } = route.params;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['doctor-rating-me', doctorId],
    queryFn: () => getMyRatingForDoctor(doctorId),
  });

  useEffect(() => {
    if (data?.rating) {
      setRating(data.rating.rating);
      setComment(data.rating.comment ?? '');
    }
  }, [data?.rating]);

  const submitMutation = useMutation({
    mutationFn: () => submitDoctorRating(doctorId, { rating, comment: comment.trim() || undefined }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['doctor-rating-me', doctorId] });
      void queryClient.invalidateQueries({ queryKey: ['doctor', doctorId] });
      void queryClient.invalidateQueries({ queryKey: ['doctor-ratings', doctorId] });
      void queryClient.invalidateQueries({ queryKey: ['doctors'] });
      showAlert(t('common.success'), t('ratings.thankYou'));
      navigation.goBack();
    },
    onError: (error) => setFormError(getApiErrorMessage(error)),
  });

  if (isLoading) {
    return (
      <ScreenShell scroll={false}>
        <ActivityIndicator className="mt-20" color={UI.primary} />
      </ScreenShell>
    );
  }

  if (!data?.eligible) {
    return (
      <ScreenShell>
        <BackButton onPress={() => navigation.goBack()} />
        <View className="mt-8 rounded-card bg-medical-card p-6" style={cardShadowStyle()}>
          <Text className="text-center text-base leading-7" style={{ color: UI.text.secondary }}>
            {t('ratings.mustCompleteAppointment')}
          </Text>
        </View>
      </ScreenShell>
    );
  }

  const isEditing = Boolean(data.rating);

  return (
    <ScreenShell>
      <BackButton onPress={() => navigation.goBack()} />

      <Text
        className="mb-2 mt-2 text-2xl text-heading"
        style={{ fontFamily: typography.fontFamily, fontWeight: typography.headingWeight }}
      >
        {isEditing ? t('ratings.editRating') : t('ratings.rateDoctor')}
      </Text>
      <Text className="mb-6 text-base" style={{ color: UI.text.secondary }}>
        {doctorName}
      </Text>

      {formError ? <TopErrorBanner message={formError} onDismiss={() => setFormError(null)} /> : null}

      <View className="mb-6 rounded-card bg-medical-card p-6" style={cardShadowStyle()}>
        <Text className="mb-4 text-center text-sm font-semibold" style={{ color: UI.text.primary }}>
          {t('ratings.selectStars')}
        </Text>
        <StarRatingInput value={rating} onChange={setRating} />
      </View>

      <Input
        label={t('ratings.commentLabel')}
        placeholder={t('ratings.commentPlaceholder')}
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        className="min-h-[120px]"
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
    </ScreenShell>
  );
}
