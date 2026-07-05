import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { UI, glassSurfaceStyle } from '../../theme/ui';

interface GlassSurfaceProps {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  radius?: number;
}

export function GlassSurface({ children, className, style, radius = UI.radius.card }: GlassSurfaceProps) {
  const shellStyle: ViewStyle = {
    overflow: 'hidden',
    borderRadius: radius,
    ...glassSurfaceStyle(),
  };

  return (
    <View className={`glass-surface glass-card ${className ?? ''}`} style={[shellStyle, style]}>
      {children}
    </View>
  );
}
