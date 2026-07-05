import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { BACKGROUNDS } from '../theme/ui';

const MESH = BACKGROUNDS.meshSky;

/** Tab scenes stay transparent (root mesh shows through) but only one tab is mounted at a time */
export const tabNavigatorScreenOptions: BottomTabNavigationOptions = {
  headerShown: false,
  sceneStyle: { backgroundColor: 'transparent' },
  lazy: true,
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
