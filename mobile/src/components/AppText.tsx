import type { ReactNode } from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { useTypography } from '../hooks/useTypography';

type AppTextWeight = 'regular' | 'medium' | 'bold';

interface AppTextProps extends TextProps {
  children: ReactNode;
  weight?: AppTextWeight;
}

export function AppText({ children, weight = 'regular', style, ...props }: AppTextProps) {
  const typography = useTypography();

  const fontFamily =
    weight === 'bold'
      ? typography.fontFamily
      : weight === 'medium'
        ? typography.fontFamilyMedium
        : typography.fontFamilyRegular;

  const textStyle: TextStyle = {
    fontFamily,
    fontWeight: typography.bodyWeight,
  };

  return (
    <Text {...props} style={[textStyle, style]}>
      {children}
    </Text>
  );
}
