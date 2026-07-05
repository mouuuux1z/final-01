import type { ReactNode } from 'react';
import { Pressable, Text, View, type PressableProps } from 'react-native';
import { UI, solidCardStyle, subtleSurfaceStyle } from '../theme/ui';
import { useTypography } from '../hooks/useTypography';
import { GlassSurface } from './ui/GlassSurface';

interface CardProps extends PressableProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  onPress?: () => void;
  variant?: 'light' | 'glass' | 'secondary';
}

export function Card({
  title,
  subtitle,
  children,
  onPress,
  variant = 'glass',
  className,
  ...props
}: CardProps & { className?: string }) {
  const isGlass = variant === 'glass';
  const isSecondary = variant === 'secondary';
  const typography = useTypography();

  const content = (
    <>
      {title ? (
        <Text
          className={`text-lg ${isGlass ? 'text-heading' : 'text-heading'}`}
          style={{ fontFamily: typography.fontFamily, fontWeight: typography.headingWeight }}
        >
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text className="mt-1 text-sm text-body">{subtitle}</Text>
      ) : null}
      {children}
    </>
  );

  const paddingClass = 'p-5';
  const radiusClass = 'rounded-card';

  if (isGlass) {
    const glassInner = (
      <GlassSurface className={paddingClass}>{content}</GlassSurface>
    );

    const glassContent = className ? (
      <View className={className} style={{ minWidth: 0 }}>
        {glassInner}
      </View>
    ) : (
      glassInner
    );

    if (onPress) {
      return (
        <Pressable onPress={onPress} className="active:opacity-90" {...props}>
          {glassContent}
        </Pressable>
      );
    }
    return glassContent;
  }

  const baseClass = isSecondary
    ? `${radiusClass} ${paddingClass}`
    : `${radiusClass} ${paddingClass}`;

  const cardStyle = isSecondary ? subtleSurfaceStyle() : solidCardStyle();

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={`${baseClass} active:opacity-90 ${className ?? ''}`}
        style={cardStyle}
        {...props}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View className={`${baseClass} ${className ?? ''}`} style={cardStyle}>
      {content}
    </View>
  );
}
