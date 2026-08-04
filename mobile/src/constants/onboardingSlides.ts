import type { ImageSourcePropType } from 'react-native';

export type OnboardingSlideId = 'wellbeing' | 'booking';

export interface OnboardingSlide {
  id: OnboardingSlideId;
  image: ImageSourcePropType;
  titleKey: `onboarding.slides.${OnboardingSlideId}.title`;
  descriptionKey: `onboarding.slides.${OnboardingSlideId}.description`;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'wellbeing',
    image: require('../../assets/onboarding-care.png'),
    titleKey: 'onboarding.slides.wellbeing.title',
    descriptionKey: 'onboarding.slides.wellbeing.description',
  },
  {
    id: 'booking',
    image: require('../../assets/onboarding-booking.png'),
    titleKey: 'onboarding.slides.booking.title',
    descriptionKey: 'onboarding.slides.booking.description',
  },
];
