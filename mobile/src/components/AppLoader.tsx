import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WifiLoader } from './WifiLoader';

type LoaderSize = 'small' | 'large' | number;

export interface AppLoaderProps {
  size?: LoaderSize;
  color?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
  showLabel?: boolean;
}

function resolveSize(size: LoaderSize): number {
  if (typeof size === 'number') return size;
  return size === 'small' ? 32 : 64;
}

/** Drop-in loading indicator with the WiFi ring animation. */
export function AppLoader({ size = 'large', className, style, showLabel }: AppLoaderProps) {
  const { t } = useTranslation();
  const dimension = resolveSize(size);
  const shouldShowLabel = showLabel ?? dimension >= 56;

  return (
    <View
      className={className}
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: shouldShowLabel ? 24 : 0,
        },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel={t('common.loading')}
    >
      <WifiLoader
        size={dimension}
        showLabel={shouldShowLabel}
        label={t('common.loading').replace(/\.\.\.$/, '')}
      />
    </View>
  );
}
