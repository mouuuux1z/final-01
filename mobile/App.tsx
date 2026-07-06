import 'react-native-gesture-handler';
import './global.css';
import './src/i18n';

import { enableScreens } from 'react-native-screens';

import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
} from '@expo-google-fonts/tajawal';
import { RootNavigator } from './src/navigation/RootNavigator';
import { LoadingScreen } from './src/components/LoadingScreen';
import { ScreenBackground } from './src/components/ui/ScreenBackground';
import { setUnauthorizedHandler, hydrateTokenCache } from './src/services/api';
import { queryClient } from './src/services/queryClient';
import { useAuthStore } from './src/store/authStore';

enableScreens(true);

function UnauthorizedHandler() {
  const logout = useAuthStore((s) => s.logout);
  const isHandlingUnauthorized = useRef(false);

  useEffect(() => {
    void hydrateTokenCache();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (useAuthStore.getState().isLoading) return;
      if (isHandlingUnauthorized.current) return;
      isHandlingUnauthorized.current = true;
      void logout().finally(() => {
        isHandlingUnauthorized.current = false;
      });
    });
  }, [logout]);

  return null;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ScreenBackground>
            <LoadingScreen />
          </ScreenBackground>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ScreenBackground>
            <UnauthorizedHandler />
            <RootNavigator />
            <StatusBar style="light" />
          </ScreenBackground>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
