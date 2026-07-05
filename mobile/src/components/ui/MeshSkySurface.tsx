import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { MeshSkyLayer } from './MeshSkyLayer';
import { meshSkySurfaceStyle } from '../../theme/ui';

interface MeshSkySurfaceProps {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  /** Keeps mesh aligned with the app root on web (`background-attachment: fixed`) */
  fixedBackground?: boolean;
}

export function MeshSkySurface({
  children,
  className,
  style,
  fixedBackground = false,
}: MeshSkySurfaceProps) {
  const webClass = fixedBackground ? 'mesh-sky-surface mesh-sky-fixed' : 'mesh-sky-surface';

  return (
    <View
      className={Platform.OS === 'web' ? `${webClass} ${className ?? ''}`.trim() : className}
      style={[styles.root, meshSkySurfaceStyle(fixedBackground), style]}
    >
      <MeshSkyLayer />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
