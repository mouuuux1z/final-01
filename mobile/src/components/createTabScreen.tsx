import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { TabScreenErrorBoundary } from './TabScreenErrorBoundary';

/**
 * Creates a stable screen wrapper so React Navigation does not remount
 * the route when the parent navigator re-renders.
 */
export function createTabScreen<P extends object>(
  Screen: ComponentType<P>,
  titleKey: string,
): ComponentType<P> {
  function WrappedTabScreen(props: P) {
    const { t } = useTranslation();
    return (
      <TabScreenErrorBoundary title={t(titleKey)}>
        <Screen {...props} />
      </TabScreenErrorBoundary>
    );
  }

  WrappedTabScreen.displayName = `Tab(${Screen.displayName ?? Screen.name ?? titleKey})`;
  return WrappedTabScreen;
}
