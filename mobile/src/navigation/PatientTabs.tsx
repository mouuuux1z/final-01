import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { PatientTabBar } from '../components/ui/PatientTabBar';
import { createTabScreen } from '../components/createTabScreen';
import { HomeScreen } from '../screens/patient/HomeScreen';
import { SearchDoctorsScreen } from '../screens/patient/SearchDoctorsScreen';
import { AppointmentsScreen } from '../screens/patient/AppointmentsScreen';
import { ProfileScreen } from '../screens/patient/ProfileScreen';
import { DoctorProfileScreen } from '../screens/patient/DoctorProfileScreen';
import { BookAppointmentScreen } from '../screens/patient/BookAppointmentScreen';
import { BookingReceiptScreen } from '../screens/patient/BookingReceiptScreen';
import { PatientMessagesScreen } from '../screens/patient/PatientMessagesScreen';
import { PatientChatScreen } from '../screens/patient/PatientChatScreen';
import { EditAccountScreen } from '../screens/shared/EditAccountScreen';
import { RateDoctorScreen } from '../screens/patient/RateDoctorScreen';
import { AboutScreen } from '../screens/shared/AboutScreen';
import {
  mainTabsStackScreenOptions,
  stackNavigatorScreenOptions,
  tabNavigatorScreenOptions,
} from './navigationOptions';
import { StackSceneLayout } from './StackSceneLayout';

export type PatientTabParamList = {
  Home: undefined;
  Appointments: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type PatientStackParamList = {
  MainTabs: NavigatorScreenParams<PatientTabParamList> | undefined;
  Search: { initialQuery?: string; initialCategory?: string } | undefined;
  DoctorProfile: { doctorId: string };
  BookAppointment: { doctorId: string; doctorName: string };
  BookingReceipt: { appointmentId: string };
  PatientChat: { doctorId: string; patientId: string; doctorName: string };
  EditProfile: undefined;
  About: undefined;
  RateDoctor: { doctorId: string; doctorName: string };
};

const Tab = createBottomTabNavigator<PatientTabParamList>();
const Stack = createNativeStackNavigator<PatientStackParamList>();

const HomeTab = createTabScreen(HomeScreen, 'tabs.home');
const AppointmentsTab = createTabScreen(AppointmentsScreen, 'tabs.appointments');
const MessagesTab = createTabScreen(PatientMessagesScreen, 'chat.messages');
const ProfileTab = createTabScreen(ProfileScreen, 'tabs.myAccount');

function PatientTabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator tabBar={(props) => <PatientTabBar {...props} />} screenOptions={tabNavigatorScreenOptions} detachInactiveScreens>
      <Tab.Screen name="Home" component={HomeTab} options={{ title: t('tabs.home') }} />
      <Tab.Screen name="Appointments" component={AppointmentsTab} options={{ title: t('tabs.appointments') }} />
      <Tab.Screen name="Messages" component={MessagesTab} options={{ title: t('chat.messages') }} />
      <Tab.Screen name="Profile" component={ProfileTab} options={{ title: t('tabs.myAccount') }} />
    </Tab.Navigator>
  );
}

export function PatientTabs() {
  return (
    <Stack.Navigator
      screenOptions={stackNavigatorScreenOptions}
      screenLayout={({ children, route }) => (
        <StackSceneLayout routeName={route.name}>{children}</StackSceneLayout>
      )}
    >
      <Stack.Screen name="MainTabs" component={PatientTabNavigator} options={mainTabsStackScreenOptions} />
      <Stack.Screen name="Search" component={SearchDoctorsScreen} />
      <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
      <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
      <Stack.Screen name="BookingReceipt" component={BookingReceiptScreen} />
      <Stack.Screen name="PatientChat" component={PatientChatScreen} />
      <Stack.Screen name="EditProfile" component={EditAccountScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="RateDoctor" component={RateDoctorScreen} />
    </Stack.Navigator>
  );
}
