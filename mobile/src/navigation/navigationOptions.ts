import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { BACKGROUNDS } from '../theme/ui';

const MESH = BACKGROUNDS.meshSky;

/**
 * Only mount the focused tab. Transparent scenes + lazy:false stacks all tabs
 * and Dashboard can paint through inactive routes (looks like UI never changes).
 */
export const tabNavigatorScreenOptions: BottomTabNavigationOptions = {
  headerShown: false,
  sceneStyle: { backgroundColor: 'transparent' },
  lazy: true,
  freezeOnBlur: true,
};

/** Stack cards use an opaque base so previous routes are not visible underneath */
export const stackNavigatorScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: MESH.primarySkyBlue },
};

/** Main tab container inside a stack — transparent so the root mesh remains visible */
export const mainTabsStackScreenOptions: NativeStackNavigationOptions = {
  contentStyle: { backgroundColor: 'transparent' },
};
