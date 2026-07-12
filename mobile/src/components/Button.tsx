import { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Pressable,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { UI, activeGlowStyle } from '../theme/ui';
import { useTypography } from '../hooks/useTypography';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const TRANSITION_MS = 250;
const PRESS_SCALE = 0.93;
const EASE = Easing.bezier(0.4, 0, 0.2, 1);

const variantBg: Record<ButtonVariant, string | undefined> = {
  primary: UI.primary,
  secondary: UI.input,
  outline: undefined,
  ghost: undefined,
  danger: UI.danger,
};

const textColor: Record<ButtonVariant, string> = {
  primary: '#ffffff',
  secondary: UI.text.primary,
  outline: UI.primary,
  ghost: UI.primary,
  danger: '#ffffff',
};

export function Button({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  disabled,
  className,
  style,
  ...props
}: ButtonProps & { className?: string }) {
  const isDisabled = disabled || loading;
  const bg = variantBg[variant];
  const isPrimary = variant === 'primary';
  const typography = useTypography();
  const scale = useRef(new Animated.Value(1)).current;

  const animateScale = (toValue: number) => {
    Animated.timing(scale, {
      toValue,
      duration: TRANSITION_MS,
      easing: EASE,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPressIn={() => animateScale(PRESS_SCALE)}
      onPressOut={() => animateScale(1)}
      className={`press-scale ${Platform.OS === 'web' ? 'cursor-pointer' : ''} ${isPrimary ? 'btn-primary' : ''} ${className ?? ''}`}
      style={[fullWidth ? { width: '100%' } : undefined, isDisabled ? { opacity: 0.5 } : undefined]}
      {...props}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingVertical: 16,
            borderRadius: UI.radius.button,
            transform: [{ scale }],
          },
          bg ? { backgroundColor: bg } : undefined,
          variant === 'outline' ? { borderWidth: 1, borderColor: UI.primary } : undefined,
          isPrimary ? activeGlowStyle() : undefined,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor[variant]} />
        ) : (
          <Text
            className="text-center text-base"
            style={{
              color: textColor[variant],
              fontFamily: typography.fontFamilyMedium,
              fontWeight: isPrimary ? '700' : typography.bodyWeight,
            }}
          >
            {title}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}
