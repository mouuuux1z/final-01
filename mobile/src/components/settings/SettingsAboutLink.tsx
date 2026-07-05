import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../AppIcon';
import { UI, cardShadowStyle } from '../../theme/ui';

interface SettingsAboutLinkProps {
  onPress: () => void;
  variant?: 'card' | 'plain';
}

export function SettingsAboutLink({ onPress, variant = 'card' }: SettingsAboutLinkProps) {
  const { t } = useTranslation();

  const content = (
    <View className="flex-row items-center">
      <View
        className="mr-4 h-12 w-12 items-center justify-center rounded-card"
        style={{ backgroundColor: UI.primaryLight }}
      >
        <AppIcon name="info" size={24} color={UI.primary} strokeWidth={2} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold" style={{ color: UI.text.primary }}>
          {t('about.title')}
        </Text>
        <Text className="mt-0.5 text-sm" style={{ color: UI.text.secondary }}>
          {t('about.privacyPolicyHint')}
        </Text>
      </View>
      <AppIcon name="menu" size={18} color={UI.text.muted} strokeWidth={2} />
    </View>
  );

  if (variant === 'plain') {
    return (
      <Pressable onPress={onPress} className="py-3 active:opacity-80">
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className="mb-4 rounded-card border bg-white p-5 active:opacity-90"
      style={{ borderColor: UI.border, ...cardShadowStyle() }}
    >
      {content}
    </Pressable>
  );
}
