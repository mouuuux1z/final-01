import 'react-native-gesture-handler';
import './global.css';
import './src/i18n';

import { enableScreens } from 'react-native-screens';

import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { useEffect, useRef } from 'react';
import { useAppFonts } from './src/hooks/useAppFonts';
import { logRuntimeDiagnostics } from './src/constants/runtimeConfig';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AppErrorBoundary } from './src/components/AppErrorBoundary';
import { FontVariables } from './src/components/FontVariables';
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
    logRuntimeDiagnostics();
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

function MainContent() {
  const { fontsReady, fontError, arabicFontsLoaded } = useAppFonts();

  if (!fontsReady) {
    return <LoadingScreen />;
  }

  if (fontError && Platform.OS !== 'web') {
    console.warn('[fonts] Failed to load core fonts:', fontError);
  }

  return (
    <FontVariables arabicFontsLoaded={arabicFontsLoaded}>
      <UnauthorizedHandler />
      <RootNavigator />
      <StatusBar style="dark" />
    </FontVariables>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <QueryClientProvider client={queryClient}>
            <ScreenBackground>
              <MainContent />
            </ScreenBackground>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AppErrorBoundary>
  );
}
