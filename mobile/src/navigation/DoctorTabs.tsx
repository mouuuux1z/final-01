import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { GlassBottomTabBar, type TabBarRouteConfig } from '../components/ui/GlassBottomTabBar';
import { createTabScreen } from '../components/createTabScreen';
import { tabNavigatorScreenOptions } from './navigationOptions';
import { DoctorDashboardScreen } from '../screens/doctor/DoctorDashboardScreen';
import { DoctorScheduleScreen } from '../screens/doctor/DoctorScheduleScreen';
import { DoctorAppointmentsScreen } from '../screens/doctor/DoctorAppointmentsScreen';
import { DoctorPatientsScreen } from '../screens/doctor/DoctorPatientsScreen';
import { DoctorSettingsScreen } from '../screens/doctor/DoctorSettingsScreen';

export type DoctorTabParamList = {
  Dashboard: undefined;
  Schedule: undefined;
  Appointments: undefined;
  Patients: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<DoctorTabParamList>();

const DOCTOR_TAB_ROUTES: Record<string, TabBarRouteConfig> = {
  Dashboard: { icon: 'dashboard', labelKey: 'tabs.dashboard' },
  Schedule: { icon: 'schedule', labelKey: 'tabs.schedule' },
  Appointments: { icon: 'calendar', labelKey: 'tabs.appointments' },
  Patients: { icon: 'patients', labelKey: 'tabs.patients' },
  Settings: { icon: 'settings', labelKey: 'tabs.settings' },
};

const DashboardTab = createTabScreen(DoctorDashboardScreen, 'tabs.dashboard');
const ScheduleTab = createTabScreen(DoctorScheduleScreen, 'tabs.schedule');
const AppointmentsTab = createTabScreen(DoctorAppointmentsScreen, 'tabs.appointments');
const PatientsTab = createTabScreen(DoctorPatientsScreen, 'tabs.patients');
const SettingsTab = createTabScreen(DoctorSettingsScreen, 'tabs.settings');

export function DoctorTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      tabBar={(props) => <GlassBottomTabBar {...props} routes={DOCTOR_TAB_ROUTES} />}
      screenOptions={tabNavigatorScreenOptions}
      detachInactiveScreens
    >
      <Tab.Screen name="Dashboard" component={DashboardTab} options={{ title: t('tabs.dashboard') }} />
      <Tab.Screen name="Schedule" component={ScheduleTab} options={{ title: t('tabs.schedule') }} />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsTab}
        options={{ title: t('tabs.appointments') }}
      />
      <Tab.Screen name="Patients" component={PatientsTab} options={{ title: t('tabs.patients') }} />
      <Tab.Screen name="Settings" component={SettingsTab} options={{ title: t('tabs.settings') }} />
    </Tab.Navigator>
  );
}
