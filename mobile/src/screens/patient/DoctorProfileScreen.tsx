import { Pressable, Text, View } from 'react-native';
import { AppLoader } from '../../components/AppLoader';

import { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { useQuery } from '@tanstack/react-query';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppIcon } from '../../components/AppIcon';

import { BackButton } from '../../components/BackButton';

import { Button } from '../../components/Button';

import { DoctorReviewsModal } from '../../components/ratings/DoctorReviewsModal';

import { ScreenShell } from '../../components/ui/ScreenShell';

import { UI, cardShadowStyle } from '../../theme/ui';

import { useTypography } from '../../hooks/useTypography';

import { api } from '../../services/api';

import { getDoctorDisplayLocation } from '../../utils/doctorLocation';

import { formatDoctorRatingLabel } from '../../utils/doctorRating';

import type { ApiResponse, Doctor } from '../../types';

import type { PatientStackParamList } from '../../navigation/PatientTabs';

type Props = NativeStackScreenProps<PatientStackParamList, 'DoctorProfile'>;

export function DoctorProfileScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const typography = useTypography();
  const { doctorId } = route.params;
  const [reviewsVisible, setReviewsVisible] = useState(false);

  const { data: doctor, isLoading } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Doctor>>(`/doctors/${doctorId}`);
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <ScreenShell scroll={false}>
        <AppLoader className="mt-20" />
      </ScreenShell>
    );
  }

  if (!doctor) {
    return (
      <ScreenShell>
        <Text style={{ color: UI.text.secondary }}>{t('common.noResults')}</Text>
      </ScreenShell>
    );
  }

  const displayLocation = getDoctorDisplayLocation(doctor);
  const ratingLabel = formatDoctorRatingLabel(doctor.rating);
  const reviewCount = doctor.ratingCount ?? 0;

  return (
    <>
      <ScreenShell contentContainerClassName="pb-8">
        <BackButton onPress={() => navigation.goBack()} />

        <View className="mb-5 overflow-hidden rounded-card p-6" style={{ backgroundColor: UI.primary, ...cardShadowStyle() }}>
          <View className="flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-card bg-white/20">
              <AppIcon name="doctors" size={30} color="#FFFFFF" strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text
                className="text-xl text-white"
                style={{ fontFamily: typography.fontFamily, fontWeight: typography.headingWeight }}
              >
                {doctor.name}
              </Text>
              <Text className="mt-0.5 text-sm text-white/80">{doctor.specialization}</Text>
              <View className="mt-2 flex-row items-center gap-3">
                <Text className="text-sm font-bold text-amber-300">{ratingLabel}</Text>
                {reviewCount > 0 ? (
                  <Text className="text-xs text-white/70">
                    {t('ratings.reviewsCount', { count: reviewCount })}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => setReviewsVisible(true)}
          className="mb-4 flex-row items-center rounded-card border bg-white p-4 active:opacity-90"
          style={{ borderColor: UI.border, ...cardShadowStyle() }}
        >
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-btn" style={{ backgroundColor: UI.primaryLight }}>
            <Text className="text-lg text-amber-500">★</Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold" style={{ color: UI.text.primary }}>
              {t('ratings.reviews')}
            </Text>
            <Text className="mt-0.5 text-xs" style={{ color: UI.text.secondary }}>
              {reviewCount > 0
                ? t('ratings.showAllReviews', { count: reviewCount })
                : t('ratings.noReviews')}
            </Text>
          </View>
          <AppIcon name="messages" size={18} color={UI.primary} strokeWidth={2} />
        </Pressable>

        <View className="mb-4 rounded-card bg-medical-card p-5" style={cardShadowStyle()}>
          <Text className="mb-2 text-base font-bold" style={{ color: UI.text.primary }}>{t('doctor.about')}</Text>
          <Text className="text-sm leading-6" style={{ color: UI.text.secondary }}>
            {doctor.description ?? `${doctor.name} — ${doctor.specialization}, ${doctor.city}`}
          </Text>
        </View>

        <View className="mb-4 rounded-card bg-medical-card p-5" style={cardShadowStyle()}>
          <View className="gap-3">
            <View className="flex-row justify-between">
              <Text style={{ color: UI.text.secondary }}>{t('doctor.city')}</Text>
              <Text className="font-semibold" style={{ color: UI.text.primary }}>{doctor.city}</Text>
            </View>
            {displayLocation ? (
              <View className="flex-row justify-between">
                <Text style={{ color: UI.text.secondary }}>{t('doctor.location')}</Text>
                <Text className="max-w-[60%] text-right font-semibold" style={{ color: UI.text.primary }}>
                  {displayLocation}
                </Text>
              </View>
            ) : null}
            <View className="flex-row justify-between">
              <Text style={{ color: UI.text.secondary }}>{t('doctor.phone')}</Text>
              <Text className="font-semibold" style={{ color: UI.text.primary }}>{doctor.phone}</Text>
            </View>
          </View>
        </View>

        <Button
          title={t('doctor.bookNow')}
          onPress={() => navigation.navigate('BookAppointment', { doctorId: doctor.id, doctorName: doctor.name })}
        />
      </ScreenShell>

      <DoctorReviewsModal
        visible={reviewsVisible}
        onClose={() => setReviewsVisible(false)}
        doctorId={doctor.id}
        doctorName={doctor.name}
        ratingCount={reviewCount}
      />
    </>
  );
}
