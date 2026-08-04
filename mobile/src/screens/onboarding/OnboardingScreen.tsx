import { useCallback, useState } from 'react';
import { Dimensions, Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { ONBOARDING_SLIDES, type OnboardingSlide } from '../../constants/onboardingSlides';
import { useTypography } from '../../hooks/useTypography';
import { markOnboardingCompleted } from '../../services/onboardingStorage';
import { UI } from '../../theme/ui';
import type { AuthStackParamList } from '../../navigation/AuthStack';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.52;

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

function PaginationDots({ count, activeIndex }: { count: number; activeIndex: number }) {
  return (
    <View className="mb-5 flex-row items-center justify-center gap-2">
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={{
            height: 8,
            width: index === activeIndex ? 28 : 8,
            borderRadius: 999,
            backgroundColor: index === activeIndex ? UI.primary : '#D1D5DB',
          }}
        />
      ))}
    </View>
  );
}

function OnboardingSlideCard({ slide }: { slide: OnboardingSlide }) {
  const { t } = useTranslation();
  const typography = useTypography();

  return (
    <View className="flex-1 bg-white">
      <View style={{ height: IMAGE_HEIGHT, width: '100%' }}>
        <Image source={slide.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      </View>

      <View
        className="flex-1 bg-white px-6 pt-8"
        style={{
          marginTop: -28,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
        }}
      >
        <Text
          className="mb-3 text-center text-[26px] leading-9"
          style={{
            fontFamily: typography.fontFamily,
            fontWeight: typography.headingWeight,
            color: UI.text.primary,
          }}
        >
          {t(slide.titleKey)}
        </Text>
        <Text
          className="text-center text-base leading-7"
          style={{
            fontFamily: typography.fontFamilyRegular,
            color: UI.text.secondary,
          }}
        >
          {t(slide.descriptionKey)}
        </Text>
      </View>
    </View>
  );
}

export function OnboardingScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const isLastSlide = activeIndex === ONBOARDING_SLIDES.length - 1;
  const currentSlide = ONBOARDING_SLIDES[activeIndex];

  const openLogin = useCallback(() => {
    void markOnboardingCompleted().then(() => {
      navigation.replace('Login');
    });
  }, [navigation]);

  const goToNext = useCallback(() => {
    if (isLastSlide) {
      openLogin();
      return;
    }
    setActiveIndex((index) => index + 1);
  }, [isLastSlide, openLogin]);

  return (
    <View className="flex-1 bg-white">
      <OnboardingSlideCard slide={currentSlide} />

      <View
        className="border-t border-slate-100 bg-white px-6 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        <PaginationDots count={ONBOARDING_SLIDES.length} activeIndex={activeIndex} />
        <Button title={t('common.next')} onPress={goToNext} />
        {!isLastSlide ? (
          <Pressable onPress={openLogin} className="mt-3 items-center py-2 active:opacity-70">
            <Text className="text-sm font-medium" style={{ color: UI.text.secondary }}>
              {t('onboarding.skip')}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
