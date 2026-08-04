import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { LoadingScreen } from '../components/LoadingScreen';
import { useSocketSync } from '../hooks/useSocketSync';
import { useAuthStore } from '../store/authStore';
import { hasCompletedOnboarding } from '../services/onboardingStorage';
import { AuthStack, type AuthStackParamList } from './AuthStack';
import { PatientTabs } from './PatientTabs';
import { DoctorRootStack } from './DoctorRootStack';
import { ClinicStack } from './ClinicStack';
import { AdminStack } from './AdminStack';
import { appNavigationTheme } from './appNavigationTheme';

export function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const userType = useAuthStore((s) => s.userType);
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const sessionChecked = useRef(false);
  const [authInitialRoute, setAuthInitialRoute] = useState<keyof AuthStackParamList>('Login');
  const [authRouteReady, setAuthRouteReady] = useState(false);

  useSocketSync();

  useEffect(() => {
    void hasCompletedOnboarding().then((completed) => {
      setAuthInitialRoute(completed ? 'Login' : 'Onboarding');
      setAuthRouteReady(true);
    });
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      useAuthStore.getState().setHydrated(true);
    }

    const hydrationTimer = setTimeout(() => {
      if (!useAuthStore.getState().isHydrated) {
        useAuthStore.getState().setHydrated(true);
      }
    }, Platform.OS === 'web' ? 500 : 2500);

    return () => clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    if (!isHydrated || sessionChecked.current) return;
    sessionChecked.current = true;

    const { isAuthenticated, token } = useAuthStore.getState();
    if (isAuthenticated && token) {
      return;
    }

    void restoreSession();
  }, [isHydrated, restoreSession]);

  if (!isHydrated || !authRouteReady) {
    return <LoadingScreen />;
  }

  const renderApp = () => {
    if (!isAuthenticated) {
      return <AuthStack initialRouteName={authInitialRoute} />;
    }

    switch (userType) {
      case 'PATIENT':
        return <PatientTabs />;
      case 'DOCTOR':
        return <DoctorRootStack />;
      case 'CLINIC':
        return <ClinicStack />;
      case 'ADMIN':
        return <AdminStack />;
      default:
        return <AuthStack initialRouteName="Login" />;
    }
  };

  const navigationKey = isAuthenticated ? `app-${userType ?? 'unknown'}` : 'auth';

  return (
    <NavigationContainer key={navigationKey} theme={appNavigationTheme}>
      <View style={styles.navRoot}>{renderApp()}</View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  navRoot: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
