import { I18nManager, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from './AppIcon';
import { UI, cardShadowStyle } from '../theme/ui';

interface BackButtonProps {
  onPress: () => void;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function BackButton({ onPress, className, style }: BackButtonProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('common.back')}
      className={`mb-4 h-12 w-12 items-center justify-center rounded-pill active:opacity-80 ${className ?? ''}`}
      style={[
        {
          backgroundColor: UI.surface,
          ...cardShadowStyle(),
        },
        style,
      ]}
    >
      <View style={I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined}>
        <AppIcon name="back" size={22} color={UI.primary} strokeWidth={2.5} />
      </View>
    </Pressable>
  );
}
