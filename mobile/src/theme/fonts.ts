import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

/** Babelfont Madika Arabic TRIAL — evaluation license; replace with licensed files for production. */
export const APP_FONT_SOURCES = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  MadikaArabic_400Regular: require('../../assets/fonts/MadikaArabic-Regular.otf'),
  MadikaArabic_500Medium: require('../../assets/fonts/MadikaArabic-Medium.otf'),
  MadikaArabic_800ExtraBold: require('../../assets/fonts/MadikaArabic-ExtraBold.otf'),
} as const;
