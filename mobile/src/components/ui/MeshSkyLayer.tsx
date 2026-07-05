import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BACKGROUNDS } from '../../theme/ui';
import { NATIVE_STARS, STAR_SHADOWS } from './starfieldData';

const SKY = BACKGROUNDS.meshSky;

const webStarDots = (boxShadow: string, size: number, top = 0): ViewStyle =>
  ({
    position: 'absolute',
    top,
    left: 0,
    width: size,
    height: size,
    backgroundColor: 'transparent',
    boxShadow,
  }) as ViewStyle;

function WebStarLayer({
  boxShadow,
  size,
  animClass,
}: {
  boxShadow: string;
  size: number;
  animClass: string;
}) {
  return (
    <View className={animClass} style={styles.webAnimHost}>
      <View style={webStarDots(boxShadow, size, 0)} />
      <View style={webStarDots(boxShadow, size, 2000)} />
    </View>
  );
}

export function MeshSkyLayer() {
  if (Platform.OS === 'web') {
    return (
      <View style={[StyleSheet.absoluteFillObject, styles.webRoot]} pointerEvents="none">
        <View style={styles.webStarsHost}>
          <WebStarLayer boxShadow={STAR_SHADOWS.small} size={1} animClass="starfield-layer--slow" />
          <WebStarLayer boxShadow={STAR_SHADOWS.medium} size={2} animClass="starfield-layer--medium" />
          <WebStarLayer boxShadow={STAR_SHADOWS.large} size={3} animClass="starfield-layer--fast" />
        </View>
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <LinearGradient
        colors={[...SKY.linearColors]}
        locations={[...SKY.linearLocations]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {NATIVE_STARS.map((star, index) => (
        <View
          key={`star-${index}`}
          style={{
            position: 'absolute',
            left: `${(star.left / 2000) * 100}%`,
            top: `${(star.top / 2000) * 100}%`,
            width: star.size,
            height: star.size,
            borderRadius: star.size,
            backgroundColor: '#FFFFFF',
            opacity: star.opacity,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  webRoot: {
    overflow: 'hidden',
    backgroundColor: SKY.base,
    ...(Platform.OS === 'web'
      ? ({ backgroundImage: SKY.cssGradient } as ViewStyle)
      : null),
  },
  webStarsHost: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  webAnimHost: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
});
