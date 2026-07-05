import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { GlassBottomTabBar, type TabBarRouteConfig } from '../components/ui/GlassBottomTabBar';
import { ClinicDashboardScreen } from '../screens/clinic/ClinicDashboardScreen';
import { ClinicDoctorsScreen } from '../screens/clinic/ClinicDoctorsScreen';
import { ClinicSettingsScreen } from '../screens/clinic/ClinicSettingsScreen';
import { tabNavigatorScreenOptions } from './navigationOptions';

export type ClinicTabParamList = {
  Dashboard: undefined;
  Doctors: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<ClinicTabParamList>();

const CLINIC_TAB_ROUTES: Record<string, TabBarRouteConfig> = {
  Dashboard: { icon: 'dashboard', labelKey: 'tabs.dashboard' },
  Doctors: { icon: 'doctors', labelKey: 'clinic.doctors' },
  Settings: { icon: 'settings', labelKey: 'tabs.settings' },
};

export function ClinicTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      tabBar={(props) => <GlassBottomTabBar {...props} routes={CLINIC_TAB_ROUTES} />}
      screenOptions={tabNavigatorScreenOptions}
    >
      <Tab.Screen name="Dashboard" component={ClinicDashboardScreen} options={{ title: t('tabs.dashboard') }} />
      <Tab.Screen name="Doctors" component={ClinicDoctorsScreen} options={{ title: t('clinic.doctors') }} />
      <Tab.Screen name="Settings" component={ClinicSettingsScreen} options={{ title: t('tabs.settings') }} />
    </Tab.Navigator>
  );
}
