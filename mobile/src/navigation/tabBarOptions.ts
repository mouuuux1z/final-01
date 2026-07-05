import { Platform } from 'react-native';
import { TAB_ACTIVE_COLOR, TAB_INACTIVE_COLOR } from '../components/AppIcon';
import { UI, navShadowStyle, getTypography } from '../theme/ui';
import i18n from '../i18n';

export function getDefaultTabBarOptions() {
  const typography = getTypography(i18n.language);

  return {
    headerShown: false,
    tabBarActiveTintColor: TAB_ACTIVE_COLOR,
    tabBarInactiveTintColor: TAB_INACTIVE_COLOR,
    tabBarStyle: {
      backgroundColor: UI.tabBar.background,
      borderTopWidth: 0,
      paddingTop: 8,
      paddingBottom: Platform.OS === 'web' ? 12 : 8,
      height: Platform.OS === 'web' ? 72 : 64,
      ...navShadowStyle(),
      ...(Platform.OS === 'web' ? { position: 'relative' as const } : {}),
    },
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: '600' as const,
      fontFamily: typography.fontFamilyMedium,
    },
    sceneContainerStyle: { backgroundColor: 'transparent' },
    lazy: true,
  };
}
