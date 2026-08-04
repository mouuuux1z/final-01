import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../AppIcon';
import { UI } from '../../theme/ui';
import { useTypography } from '../../hooks/useTypography';
import { GlassSurface } from './GlassSurface';

export function PatientHeader() {
  const { t } = useTranslation();
  const typography = useTypography();

  return (
    <View className="mb-5">
      <Text
        className="text-3xl text-on-sky"
        style={{ fontFamily: typography.fontFamily, fontWeight: typography.headingWeight }}
      >
        {t('home.welcomeBack')}
      </Text>
    </View>
  );
}

interface SearchHeroProps {
  onPress: () => void;
}

export function SearchHero({ onPress }: SearchHeroProps) {
  const { t } = useTranslation();
  const typography = useTypography();

  return (
    <View className="mb-6">
      <Text
        className="mb-4 text-2xl text-on-sky"
        style={{ fontFamily: typography.fontFamily, fontWeight: typography.headingWeight }}
      >
        {t('home.searchHeroTitle')}
      </Text>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={t('home.searchPlaceholder')}
        className="active:opacity-90"
      >
        <GlassSurface className="flex-row items-center gap-3 rounded-pill px-5 py-4">
          <View
            pointerEvents="none"
            className="h-10 w-10 items-center justify-center rounded-pill"
            style={{ backgroundColor: UI.backgrounds.cardSubtle }}
          >
            <AppIcon name="search" size={20} color={UI.primary} strokeWidth={2.25} />
          </View>
          <Text className="flex-1 text-base text-body">{t('home.searchPlaceholder')}</Text>
        </GlassSurface>
      </Pressable>
    </View>
  );
}

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const typography = useTypography();

  return (
    <View className="mb-4 flex-row items-center justify-between">
      <Text
        className="text-lg text-on-sky"
        style={{ fontFamily: typography.fontFamily, fontWeight: typography.headingWeight }}
      >
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} className="rounded-pill px-3 py-1.5 active:opacity-80">
          <Text className="text-sm font-semibold text-primary">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
