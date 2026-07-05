import type { ReactNode } from 'react';
import { ScrollView, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenShellProps extends ScrollViewProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  bottomInset?: number;
}

export function ScreenShell({
  children,
  scroll = true,
  padded = true,
  bottomInset = 88,
  contentContainerClassName,
  className,
  ...scrollProps
}: ScreenShellProps) {
  const insets = useSafeAreaInsets();
  const paddingTop = Math.max(insets.top, 8);
  const paddingBottom = bottomInset + insets.bottom;
  const horizontal = padded ? 'px-6' : '';

  if (scroll) {
    return (
      <ScrollView
        className={`flex-1 ${className ?? ''}`}
        showsVerticalScrollIndicator={false}
        contentContainerClassName={`${horizontal} ${contentContainerClassName ?? ''}`}
        contentContainerStyle={{ paddingTop, paddingBottom }}
        {...scrollProps}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View
      className={`flex-1 ${horizontal} ${className ?? ''}`}
      style={{ paddingTop, paddingBottom: insets.bottom }}
    >
      {children}
    </View>
  );
}
