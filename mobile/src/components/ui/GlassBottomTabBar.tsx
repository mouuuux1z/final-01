import { Platform, StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TabActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { AppIconName } from '../AppIcon';
import { UI } from '../../theme/ui';
import { GlassSurface } from './GlassSurface';
import { BottomNavItem } from './BottomNavItem';

export type TabBarRouteConfig = {
  icon: AppIconName;
  labelKey?: string;
};

export interface GlassBottomTabBarProps extends BottomTabBarProps {
  routes: Record<string, TabBarRouteConfig>;
  showBadgeForRoute?: (routeName: string) => boolean;
}

/**
 * Non-absolute tab bar so Android/react-native-screens cannot cover touch targets.
 * Uses TabActions.jumpTo with target so nested tab navigators switch reliably.
 */
export function GlassBottomTabBar({
  state,
  descriptors,
  navigation,
  routes,
  showBadgeForRoute,
}: GlassBottomTabBarProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.shell,
        { paddingBottom: Math.max(insets.bottom, Platform.OS === 'web' ? 16 : 10) },
      ]}
    >
      <GlassSurface radius={UI.radius.card} className="bottom-nav-menu" style={styles.surface}>
        <View style={styles.menu}>
          {state.routes.map((route, routeIndex) => {
            const config = routes[route.name];
            if (!config) return null;

            const isFocused = state.index === routeIndex;
            const { options } = descriptors[route.key];
            const label = options.title ?? (config.labelKey ? t(config.labelKey) : route.name);
            const showBadge = showBadgeForRoute?.(route.name) ?? false;

            return (
              <BottomNavItem
                key={route.key}
                icon={config.icon}
                label={label}
                isActive={isFocused}
                showBadge={showBadge}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (event.defaultPrevented) return;

                  if (!isFocused) {
                    navigation.dispatch({
                      ...TabActions.jumpTo(route.name, route.params),
                      target: state.key,
                    });
                  }
                }}
              />
            );
          })}
        </View>
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  surface: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  menu: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    minHeight: 52,
  },
});
