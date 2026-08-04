import { Text, View } from 'react-native';
import { AppLoader } from '../../components/AppLoader';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackButton } from '../../components/BackButton';
import { DoctorReviewForm } from '../../components/ratings/DoctorReviewForm';
import { ScreenShell } from '../../components/ui/ScreenShell';
import { getMyRatingForDoctor } from '../../services/ratingsApi';
import { UI, cardShadowStyle } from '../../theme/ui';
import { useTypography } from '../../hooks/useTypography';
import type { PatientStackParamList } from '../../navigation/PatientTabs';

type Props = NativeStackScreenProps<PatientStackParamList, 'RateDoctor'>;

export function RateDoctorScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const typography = useTypography();
  const { doctorId, doctorName } = route.params;

  const { data, isLoading } = useQuery({
    queryKey: ['doctor-rating-me', doctorId],
    queryFn: () => getMyRatingForDoctor(doctorId),
  });

  if (isLoading) {
    return (
      <ScreenShell scroll={false}>
        <AppLoader className="mt-20" />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <BackButton onPress={() => navigation.goBack()} />

      <Text
        className="mb-2 mt-2 text-2xl text-heading"
        style={{ fontFamily: typography.fontFamily, fontWeight: typography.headingWeight }}
      >
        {data?.rating ? t('ratings.editRating') : t('ratings.rateDoctor')}
      </Text>
      <Text className="mb-6 text-base" style={{ color: UI.text.secondary }}>
        {doctorName}
      </Text>

      <View className="rounded-card bg-medical-card p-6" style={cardShadowStyle()}>
        <DoctorReviewForm
          doctorId={doctorId}
          eligible={Boolean(data?.eligible)}
          existingRating={data?.rating}
          onSuccess={() => navigation.goBack()}
        />
      </View>
    </ScreenShell>
  );
}
