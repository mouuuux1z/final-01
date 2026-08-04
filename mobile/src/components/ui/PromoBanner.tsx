import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { UI, cardShadowStyle } from '../../theme/ui';

const PROMO_BANNER = require('../../../assets/promo-banner.png');

interface PromoBannerProps {
  onPress?: () => void;
}

export function PromoBanner({ onPress }: PromoBannerProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'image'}
      accessibilityLabel={t('home.promoBannerLabel')}
      className="mb-4 active:opacity-95"
      style={[styles.container, cardShadowStyle()]}
    >
      <View style={styles.imageWrap}>
        <Image source={PROMO_BANNER} style={styles.image} resizeMode="cover" accessibilityIgnoresInvertColors />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: UI.radius.card,
    overflow: 'hidden',
    backgroundColor: UI.surface,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
