import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { useQuery } from '@tanstack/react-query';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppIcon } from '../../components/AppIcon';

import { BackButton } from '../../components/BackButton';

import { Button } from '../../components/Button';

import { ScreenShell } from '../../components/ui/ScreenShell';

import { UI, cardShadowStyle } from '../../theme/ui';

import { useTypography } from '../../hooks/useTypography';

import { api } from '../../services/api';

import { getDoctorRatings, getMyRatingForDoctor } from '../../services/ratingsApi';

import { getDoctorDisplayLocation } from '../../utils/doctorLocation';

import { formatDoctorRatingLabel } from '../../utils/doctorRating';

import type { ApiResponse, Doctor } from '../../types';

import type { PatientStackParamList } from '../../navigation/PatientTabs';



type Props = NativeStackScreenProps<PatientStackParamList, 'DoctorProfile'>;



export function DoctorProfileScreen({ navigation, route }: Props) {

  const { t } = useTranslation();

  const typography = useTypography();

  const { doctorId } = route.params;



  const { data: doctor, isLoading } = useQuery({

    queryKey: ['doctor', doctorId],

    queryFn: async () => {

      const { data } = await api.get<ApiResponse<Doctor>>(`/doctors/${doctorId}`);

      return data.data;

    },

  });



  const { data: myRatingStatus } = useQuery({

    queryKey: ['doctor-rating-me', doctorId],

    queryFn: () => getMyRatingForDoctor(doctorId),

  });



  const { data: reviews, isLoading: reviewsLoading } = useQuery({

    queryKey: ['doctor-ratings', doctorId],

    queryFn: () => getDoctorRatings(doctorId, 1, 10),

  });



  if (isLoading) {

    return (

      <ScreenShell scroll={false}>

        <ActivityIndicator className="mt-20" color={UI.primary} />

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

  const canRate = myRatingStatus?.eligible;

  const hasRated = Boolean(myRatingStatus?.rating);



  return (

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

            </View>

          </View>

        </View>

      </View>



      {canRate ? (

        <Pressable

          onPress={() => navigation.navigate('RateDoctor', { doctorId: doctor.id, doctorName: doctor.name })}

          className="mb-4 flex-row items-center rounded-card border bg-white p-4 active:opacity-90"

          style={{ borderColor: UI.border, ...cardShadowStyle() }}

        >

          <View className="mr-3 h-10 w-10 items-center justify-center rounded-btn" style={{ backgroundColor: '#FEF3C7' }}>

            <Text className="text-lg text-amber-500">★</Text>

          </View>

          <View className="flex-1">

            <Text className="text-sm font-semibold" style={{ color: UI.text.primary }}>

              {hasRated ? t('ratings.editRating') : t('ratings.rateDoctor')}

            </Text>

            {hasRated ? (

              <Text className="mt-0.5 text-xs" style={{ color: UI.text.secondary }}>

                {t('ratings.yourRating')}: {myRatingStatus?.rating?.rating}/5

              </Text>

            ) : null}

          </View>

          <AppIcon name="menu" size={16} color={UI.text.muted} strokeWidth={2} />

        </Pressable>

      ) : null}



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



      <View className="mb-6 rounded-card bg-medical-card p-5" style={cardShadowStyle()}>

        <Text className="mb-4 text-base font-bold" style={{ color: UI.text.primary }}>

          {t('ratings.reviews')}

        </Text>

        {reviewsLoading ? (

          <ActivityIndicator color={UI.primary} />

        ) : (reviews?.items?.length ?? 0) > 0 ? (

          <View className="gap-4">

            {(reviews?.items ?? []).map((review) => (

              <View key={review.id} className="border-b pb-4" style={{ borderColor: UI.border }}>

                <View className="flex-row items-center justify-between">

                  <Text className="text-sm font-semibold" style={{ color: UI.text.primary }}>

                    {review.patientName}

                  </Text>

                  <Text className="text-sm font-bold text-amber-500">★ {review.rating}</Text>

                </View>

                {review.comment ? (

                  <Text className="mt-2 text-sm leading-6" style={{ color: UI.text.secondary }}>

                    {review.comment}

                  </Text>

                ) : null}

              </View>

            ))}

          </View>

        ) : (

          <Text className="text-sm" style={{ color: UI.text.secondary }}>

            {t('ratings.noReviews')}

          </Text>

        )}

      </View>



      <Button

        title={t('doctor.bookNow')}

        onPress={() => navigation.navigate('BookAppointment', { doctorId: doctor.id, doctorName: doctor.name })}

      />

    </ScreenShell>

  );

}


