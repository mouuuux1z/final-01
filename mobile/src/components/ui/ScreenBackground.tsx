import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { MeshSkyLayer } from './MeshSkyLayer';
import { BACKGROUNDS } from '../../theme/ui';

const MESH = BACKGROUNDS.meshSky;

interface ScreenBackgroundProps {
  children: ReactNode;
  style?: ViewStyle;
  className?: string;
}

export function ScreenBackground({ children, style, className }: ScreenBackgroundProps) {
  return (
    <View className={className} style={[{ flex: 1, backgroundColor: MESH.base }, style]}>
      <MeshSkyLayer />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
