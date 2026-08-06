import { Platform, type TextStyle, type ViewStyle } from 'react-native';
import {
  SPECIALTY_CATEGORIES,
  getSpecializationFilter,
  type SpecialtyCategoryId,
} from '../constants/specialties';
import { areArabicFontsLoaded } from './fontAvailability';

/** Visual identity sourced from backend/prisma/info.json */
export const FONT_STACKS = {
  arabic: {
    regular: 'MadikaArabic_400Regular',
    medium: 'MadikaArabic_500Medium',
    bold: 'MadikaArabic_800ExtraBold',
    css: 'MadikaArabic, sans-serif',
  },
  english: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    bold: 'Inter_700Bold',
    css: 'Inter, sans-serif',
  },
} as const;

export type AppTypography = {
  fontFamily: string;
  fontFamilyMedium: string;
  fontFamilyRegular: string;
  headingWeight: TextStyle['fontWeight'];
  bodyWeight: TextStyle['fontWeight'];
};

export function isArabicLanguage(language?: string): boolean {
  return language?.startsWith('ar') ?? false;
}

export type FontWeightKind = 'regular' | 'medium' | 'bold';

export function getTypography(language?: string): AppTypography {
  const wantsArabic = isArabicLanguage(language);
  const stack =
    wantsArabic && areArabicFontsLoaded() ? FONT_STACKS.arabic : FONT_STACKS.english;
  const useNamedFontFiles = Platform.OS !== 'web';

  return {
    fontFamily: stack.bold,
    fontFamilyMedium: stack.medium,
    fontFamilyRegular: stack.regular,
    // Android ignores custom fontFamily when fontWeight is also set on the same Text node.
    headingWeight: useNamedFontFiles ? 'normal' : '700',
    bodyWeight: useNamedFontFiles ? 'normal' : '400',
  };
}

/** Apply a loaded font file without triggering Android fontWeight conflicts. */
export function withCustomFont(
  typography: AppTypography,
  weight: FontWeightKind = 'regular',
): Pick<TextStyle, 'fontFamily' | 'fontWeight'> {
  const fontFamily =
    weight === 'bold'
      ? typography.fontFamily
      : weight === 'medium'
        ? typography.fontFamilyMedium
        : typography.fontFamilyRegular;

  return {
    fontFamily,
    fontWeight: weight === 'bold' ? typography.headingWeight : typography.bodyWeight,
  };
}

/** Medical app background (soft light blue image + fallback). */
export const BACKGROUNDS = {
  meshSky: {
    primarySkyBlue: '#E8F4FC',
    base: '#E8F4FC',
    purpleGlow: '#D6ECF8',
    softCloudWhite: '#FFFFFF',
    deepAccentBlue: '#B8D9F0',
    midToneBlue: '#D0E8F7',
    linearColors: ['#D6ECF8', '#E8F4FC', '#FFFFFF'] as const,
    linearLocations: [0, 0.45, 1] as const,
    cssGradient: 'linear-gradient(180deg, #D6ECF8 0%, #E8F4FC 45%, #FFFFFF 100%)',
    css: 'background-color: #E8F4FC; background-image: linear-gradient(180deg, #D6ECF8 0%, #E8F4FC 45%, #FFFFFF 100%);',
  },
  appRootGradient: {
    colors: ['#D6ECF8', '#E8F4FC', '#FFFFFF'] as const,
    locations: [0, 0.45, 1] as const,
    css: 'linear-gradient(180deg, #D6ECF8 0%, #E8F4FC 45%, #FFFFFF 100%)',
  },
  glass: {
    backgroundColor: '#ffffff',
    borderColor: '#E8EEF8',
    blurIntensity: 0,
  },
  cardPure: '#ffffff',
  cardSubtle: '#f4f7fe',
} as const;

export const UI = {
  primary: '#0066ff',
  primaryAccent: '#1a75ff',
  primaryLight: '#f4f9ff',
  background: '#E8F4FC',
  backgroundMid: '#D6ECF8',
  backgroundEnd: '#FFFFFF',
  onBackground: '#090f20',
  onBackgroundMuted: '#5a6578',
  surface: BACKGROUNDS.cardPure,
  input: BACKGROUNDS.cardSubtle,
  danger: '#f44336',
  mint: '#80EDD2',
  mintDark: '#1B4332',
  mintLight: '#D8F9F0',
  text: {
    primary: '#090f20',
    secondary: '#7a8293',
    muted: '#7a8293',
    link: '#0066ff',
    onPrimary: '#FFFFFF',
  },
  border: '#E8EEF8',
  shadow: '#0066ff',
  gradient: BACKGROUNDS.meshSky,
  backgrounds: BACKGROUNDS,
  tabBar: {
    background: BACKGROUNDS.glass.backgroundColor,
    border: BACKGROUNDS.glass.borderColor,
    active: '#0066ff',
    inactive: '#a2aab8',
    hover: 'rgba(0, 102, 255, 0.05)',
    activePill: '#0066ff',
  },
  radius: {
    card: 28,
    button: 24,
    input: 28,
    pill: 50,
    lg: 28,
  },
  spacing: {
    screen: 24,
  },
  /** @deprecated Use getTypography(language) or useTypography() for locale-aware fonts */
  typography: getTypography('en'),
} as const;

export function cardShadowStyle(): ViewStyle {
  return glassCardShadowStyle();
}

export function glassCardShadowStyle(): ViewStyle {
  return {
    shadowColor: '#090f20',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0px 6px 16px rgba(9, 15, 32, 0.08)' } as ViewStyle)
      : {}),
  };
}

export function navShadowStyle(): ViewStyle {
  return glassCardShadowStyle();
}

export function activeGlowStyle(): ViewStyle {
  return {
    shadowColor: UI.primary,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0px 8px 20px rgba(0, 102, 255, 0.25)' } as ViewStyle)
      : {}),
  };
}

export function tabBarActiveGlowStyle(): ViewStyle {
  return activeGlowStyle();
}

export function glassSurfaceStyle(): ViewStyle {
  return {
    backgroundColor: BACKGROUNDS.glass.backgroundColor,
    borderWidth: 1,
    borderColor: BACKGROUNDS.glass.borderColor,
    borderRadius: UI.radius.card,
    ...glassCardShadowStyle(),
  };
}

export function meshSkySurfaceStyle(fixed = false): ViewStyle {
  const mesh = BACKGROUNDS.meshSky;

  return {
    backgroundColor: mesh.base,
    ...(Platform.OS === 'web' && fixed
      ? ({
          backgroundAttachment: 'fixed',
        } as ViewStyle)
      : {}),
  };
}

export function solidCardStyle(): ViewStyle {
  return {
    ...glassSurfaceStyle(),
  };
}

export function subtleSurfaceStyle(): ViewStyle {
  return {
    backgroundColor: BACKGROUNDS.cardSubtle,
  };
}

export function softShadowStyle(): ViewStyle {
  return cardShadowStyle();
}

export const CATEGORIES = SPECIALTY_CATEGORIES.map(({ id, labelKey, icon }) => ({
  id,
  labelKey,
  icon,
  specialization: getSpecializationFilter(id),
}));

export { SPECIALTY_CATEGORIES, getSpecializationFilter };
export type { SpecialtyCategoryId };

export function getDisplayConsultationFee(rating = 4.5): number {
  return Math.round(150 + rating * 30);
}
