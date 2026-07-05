import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TopErrorBannerProps {
  message: string | null;
  onDismiss?: () => void;
}

export function TopErrorBanner({ message, onDismiss }: TopErrorBannerProps) {
  const insets = useSafeAreaInsets();

  if (!message) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingTop: insets.top,
      }}
    >
      <View className="mx-4 mt-2 flex-row items-start gap-3 rounded-card border border-red-200 bg-red-50 px-4 py-3 shadow-sm">
        <View className="mt-0.5 h-5 w-5 items-center justify-center rounded-full bg-red-100">
          <Text className="text-xs font-bold text-error">!</Text>
        </View>
        <Text className="flex-1 text-sm font-medium leading-5 text-error">{message}</Text>
        {onDismiss ? (
          <Pressable onPress={onDismiss} hitSlop={8} className="active:opacity-70">
            <Text className="text-lg leading-5 text-red-400">×</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
