import { Platform, StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
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
      style={{
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom, Platform.OS === 'web' ? 16 : 10),
        backgroundColor: 'transparent',
      }}
    >
      <GlassSurface
        radius={UI.radius.card}
        className="bottom-nav-menu"
        style={{
          paddingVertical: 8,
          paddingHorizontal: 8,
        }}
      >
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
                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name, route.params);
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
  menu: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    minHeight: 52,
  },
});
