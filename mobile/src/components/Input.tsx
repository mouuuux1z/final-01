import { Text, TextInput, View, type TextInputProps, type TextStyle } from 'react-native';

import { UI } from '../theme/ui';
import { useTypography } from '../hooks/useTypography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  variant?: 'light' | 'glass';
  /** Use light label text when the field sits on the night-sky background. */
  tone?: 'default' | 'onSky';
}

export function Input({
  label,
  error,
  variant = 'light',
  tone = 'default',
  className,
  style,
  ...props
}: InputProps & { className?: string }) {
  const isGlass = variant === 'glass';
  const onSky = tone === 'onSky';
  const typography = useTypography();

  const labelColor = isGlass ? UI.text.onPrimary : onSky ? UI.onBackground : UI.text.primary;
  const fieldTextColor = isGlass ? UI.text.onPrimary : UI.text.primary;
  const fieldBackground = isGlass ? 'rgba(255, 255, 255, 0.12)' : UI.surface;
  const fieldBorderColor = error ? UI.danger : isGlass ? 'rgba(255, 255, 255, 0.35)' : UI.border;

  const fieldStyle: TextStyle = {
    backgroundColor: fieldBackground,
    color: fieldTextColor,
    borderWidth: 1,
    borderColor: fieldBorderColor,
    fontFamily: typography.fontFamilyRegular,
  };

  return (
    <View className="mb-4">
      {label ? (
        <Text
          className={`mb-2 text-sm ${isGlass ? 'text-white' : 'text-heading'}`}
          style={{ color: labelColor, fontFamily: typography.fontFamilyMedium, fontWeight: typography.bodyWeight }}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={isGlass ? 'rgba(255, 255, 255, 0.65)' : UI.text.secondary}
        className={`rounded-card px-5 py-4 text-base ${
          isGlass ? 'border-white/25 bg-white/10 text-white' : 'border-transparent text-heading'
        } ${error ? 'border-error' : ''} ${className ?? ''}`}
        style={[fieldStyle, style]}
        {...props}
      />
      {error ? <Text className="mt-1.5 text-sm text-error">{error}</Text> : null}
    </View>
  );
}
