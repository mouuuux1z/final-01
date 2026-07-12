import { useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { AppIcon, type AppIconName } from '../AppIcon';
import { UI, activeGlowStyle } from '../../theme/ui';
import { useTypography } from '../../hooks/useTypography';

const TRANSITION_MS = 180;
const PRESS_SCALE = 0.94;
const EASE = Easing.bezier(0.4, 0, 0.2, 1);
const ICON_SIZE = 22;

interface BottomNavItemProps {
  icon: AppIconName;
  label: string;
  isActive: boolean;
  onPress: () => void;
  showBadge?: boolean;
}

/** Use RN Pressable — RNGH Pressable often fires pressIn feedback without onPress. */
export function BottomNavItem({ icon, label, isActive, onPress, showBadge }: BottomNavItemProps) {
  const typography = useTypography();
  const scale = useRef(new Animated.Value(1)).current;

  const animateScale = (toValue: number) => {
    Animated.timing(scale, {
      toValue,
      duration: TRANSITION_MS,
      easing: EASE,
      useNativeDriver: true,
    }).start();
  };

  const tint = isActive ? '#ffffff' : UI.tabBar.inactive;
  const pillBackground = isActive ? UI.primary : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isActive ? { selected: true } : {}}
      accessibilityLabel={label}
      hitSlop={12}
      onPress={onPress}
      onPressIn={() => animateScale(PRESS_SCALE)}
      onPressOut={() => animateScale(1)}
      style={[styles.slot, Platform.OS === 'web' ? ({ cursor: 'pointer' } as ViewStyle) : undefined]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pill,
          { backgroundColor: pillBackground, transform: [{ scale }] },
          isActive ? activeGlowStyle() : undefined,
        ]}
      >
        <View style={styles.iconWrap}>
          <AppIcon name={icon} size={ICON_SIZE} color={tint} strokeWidth={isActive ? 2.5 : 1.75} />
          {showBadge ? <View style={styles.badge} /> : null}
        </View>
        <Text
          style={[
            styles.label,
            {
              color: tint,
              fontFamily: typography.fontFamilyMedium,
              fontWeight: isActive ? '700' : '400',
            },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  pill: {
    width: '100%',
    minHeight: 48,
    borderRadius: UI.radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    gap: 2,
  },
  iconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: UI.danger,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  label: {
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 1,
  },
});
