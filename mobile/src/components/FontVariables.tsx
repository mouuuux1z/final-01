import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { vars } from 'nativewind';
import { FONT_STACKS, isArabicLanguage } from '../theme/ui';
import { areArabicFontsLoaded } from '../theme/fontAvailability';

interface FontVariablesProps {
  children: ReactNode;
  arabicFontsLoaded?: boolean;
}

export function FontVariables({ children, arabicFontsLoaded }: FontVariablesProps) {
  const { i18n } = useTranslation();
  const arabicReady = arabicFontsLoaded ?? areArabicFontsLoaded();
  const stack =
    isArabicLanguage(i18n.language) && arabicReady
      ? FONT_STACKS.arabic
      : FONT_STACKS.english;

  return (
    <View
      style={[
        { flex: 1 },
        vars({
          '--font-regular': stack.regular,
          '--font-medium': stack.medium,
          '--font-semibold': stack.medium,
          '--font-bold': stack.bold,
        }),
      ]}
    >
      {children}
    </View>
  );
}
