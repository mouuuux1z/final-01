import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { vars } from 'nativewind';
import { FONT_STACKS, isArabicLanguage } from '../theme/ui';

interface FontVariablesProps {
  children: ReactNode;
}

export function FontVariables({ children }: FontVariablesProps) {
  const { i18n } = useTranslation();
  const stack = isArabicLanguage(i18n.language) ? FONT_STACKS.arabic : FONT_STACKS.english;

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
