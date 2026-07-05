import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/Button';

interface PlaceholderScreenProps {
  titleKey?: string;
  subtitleKey?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function PlaceholderScreen({
  titleKey = 'placeholder.title',
  subtitleKey = 'placeholder.subtitle',
  onAction,
  actionLabel,
}: PlaceholderScreenProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-primary-light">
        <Text className="text-4xl">🚧</Text>
      </View>
      <Text className="mb-2 text-center text-2xl font-bold text-slate-900">{t(titleKey)}</Text>
      <Text className="mb-8 text-center text-base text-slate-500">{t(subtitleKey)}</Text>
      {onAction && actionLabel ? (
        <Button title={actionLabel} onPress={onAction} fullWidth={false} className="px-8" />
      ) : null}
    </View>
  );
}
