import { Pressable, ScrollView, Text, View } from 'react-native';
import { AppLoader } from '../AppLoader';
import { useTranslation } from 'react-i18next';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { AppModal, appModalStyles } from '../AppModal';
import { Button } from '../Button';
import { DoctorReviewForm } from './DoctorReviewForm';
import { getDoctorRatings, getMyRatingForDoctor } from '../../services/ratingsApi';
import { getApiErrorMessage } from '../../services/api';
import { ReviewCard } from './ReviewCard';
import { UI, withCustomFont } from '../../theme/ui';
import { useTypography } from '../../hooks/useTypography';

interface DoctorReviewsModalProps {
  visible: boolean;
  onClose: () => void;
  doctorId: string;
  doctorName: string;
  ratingCount?: number;
}

function getNextRatingsPage(lastPage: Awaited<ReturnType<typeof getDoctorRatings>> | undefined) {
  const page = lastPage?.meta?.page;
  const totalPages = lastPage?.meta?.totalPages;
  if (typeof page !== 'number' || typeof totalPages !== 'number') {
    return undefined;
  }
  return page < totalPages ? page + 1 : undefined;
}

export function DoctorReviewsModal({
  visible,
  onClose,
  doctorId,
  doctorName,
  ratingCount = 0,
}: DoctorReviewsModalProps) {
  const { t } = useTranslation();
  const typography = useTypography();

  const { data: myRatingStatus } = useQuery({
    queryKey: ['doctor-rating-me', doctorId],
    queryFn: () => getMyRatingForDoctor(doctorId),
    enabled: visible && Boolean(doctorId),
  });

  const { data, isLoading, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['doctor-ratings', doctorId, 'all'],
      queryFn: ({ pageParam }) => getDoctorRatings(doctorId, pageParam, 20),
      initialPageParam: 1,
      getNextPageParam: getNextRatingsPage,
      enabled: visible && Boolean(doctorId),
      retry: 1,
    });

  const reviews = data?.pages.flatMap((page) => page.items ?? []) ?? [];
  const total = data?.pages[0]?.meta?.total ?? ratingCount;

  return (
    <AppModal visible={visible} onRequestClose={onClose} onBackdropPress={onClose}>
      <View className="border-b px-5 py-4" style={{ borderColor: UI.border }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-lg" style={{ ...withCustomFont(typography, 'bold'), color: UI.text.primary }}>
              {t('ratings.reviews')}
            </Text>
            <Text className="mt-0.5 text-sm" style={{ color: UI.text.secondary }}>
              {doctorName} · {t('ratings.reviewsCount', { count: total })}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            className="h-9 w-9 items-center justify-center rounded-full active:opacity-70"
            style={{ backgroundColor: UI.background }}
            accessibilityRole="button"
            accessibilityLabel={t('common.cancel')}
          >
            <Text className="text-sm font-medium" style={{ color: UI.text.secondary }}>
              {t('common.cancel')}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={appModalStyles.scroll}
        contentContainerStyle={[appModalStyles.scrollContent, { paddingHorizontal: 20, paddingTop: 16 }]}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
      >
        <View className="mb-6 rounded-card border bg-white p-4" style={{ borderColor: UI.border }}>
          <Text className="mb-3 text-base font-bold" style={{ ...withCustomFont(typography, 'bold'), color: UI.text.primary }}>
            {t('ratings.addYourReview')}
          </Text>
          <DoctorReviewForm
            doctorId={doctorId}
            eligible={Boolean(myRatingStatus?.eligible)}
            existingRating={myRatingStatus?.rating}
            onSuccess={() => {
              void refetch();
            }}
          />
        </View>

        <Text className="mb-3 text-base font-bold" style={{ ...withCustomFont(typography, 'bold'), color: UI.text.primary }}>
          {t('ratings.allPatientReviews')}
        </Text>

        {isLoading ? (
          <AppLoader className="py-8" />
        ) : isError ? (
          <View className="gap-3 py-4">
            <Text className="text-center text-sm" style={{ color: UI.text.secondary }}>
              {getApiErrorMessage(error)}
            </Text>
            <Button title={t('common.retry')} onPress={() => void refetch()} variant="outline" />
          </View>
        ) : reviews.length > 0 ? (
          <View className="gap-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                patientName={review.patientName}
                rating={review.rating}
                comment={review.comment}
                createdAt={review.createdAt}
              />
            ))}
          </View>
        ) : (
          <Text className="py-4 text-center text-sm" style={{ color: UI.text.secondary }}>
            {t('ratings.noReviews')}
          </Text>
        )}

        {hasNextPage ? (
          <View className="mt-4">
            <Button
              title={t('ratings.loadMore')}
              onPress={() => void fetchNextPage()}
              loading={isFetchingNextPage}
              variant="outline"
            />
          </View>
        ) : null}
      </ScrollView>
    </AppModal>
  );
}
