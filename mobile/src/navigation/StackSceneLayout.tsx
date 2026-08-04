import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { MeshSkyLayer } from '../components/ui/MeshSkyLayer';
import { BACKGROUNDS } from '../theme/ui';

const MAIN_TAB_ROUTE = 'MainTabs';

interface StackSceneLayoutProps {
  children: ReactNode;
  routeName?: string;
}

function MeshScene({ children }: { children: ReactNode }) {
  return (
    <View style={styles.meshRoot}>
      <MeshSkyLayer />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

/** Opaque mesh scene so transparent stack screens do not show screens beneath them */
export function StackSceneLayout({ children, routeName }: StackSceneLayoutProps) {
  if (routeName === MAIN_TAB_ROUTE || routeName === 'Onboarding') {
    return <View style={styles.transparentRoot}>{children}</View>;
  }

  return <MeshScene>{children}</MeshScene>;
}

const styles = StyleSheet.create({
  transparentRoot: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  meshRoot: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: BACKGROUNDS.meshSky.base,
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
