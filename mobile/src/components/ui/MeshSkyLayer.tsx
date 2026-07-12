import { Image, StyleSheet, View } from 'react-native';
import { BACKGROUNDS } from '../../theme/ui';

const APP_BACKGROUND = require('../../../assets/app-background.png');

/** Full-bleed medical background image (replaces the old night starfield). */
export function MeshSkyLayer() {
  return (
    <View style={[StyleSheet.absoluteFillObject, styles.root]} pointerEvents="none">
      <Image source={APP_BACKGROUND} style={styles.image} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
    backgroundColor: BACKGROUNDS.meshSky.base,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
});
