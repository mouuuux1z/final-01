import type { ReactNode } from 'react';
import { Text, type TextProps } from 'react-native';
import { useTypography } from '../hooks/useTypography';
import { withCustomFont, type FontWeightKind } from '../theme/ui';

interface AppTextProps extends TextProps {
  children: ReactNode;
  weight?: FontWeightKind;
}

export function AppText({ children, weight = 'regular', style, ...props }: AppTextProps) {
  const typography = useTypography();

  return (
    <Text {...props} style={[withCustomFont(typography, weight), style]}>
      {children}
    </Text>
  );
}
