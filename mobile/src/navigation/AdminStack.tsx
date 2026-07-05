import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminPendingDoctorsScreen } from '../screens/admin/AdminPendingDoctorsScreen';
import { AdminPendingClinicsScreen } from '../screens/admin/AdminPendingClinicsScreen';
import { AdminDoctorsScreen } from '../screens/admin/AdminDoctorsScreen';
import { AboutScreen } from '../screens/shared/AboutScreen';
import { stackNavigatorScreenOptions } from './navigationOptions';
import { StackSceneLayout } from './StackSceneLayout';

export type AdminStackParamList = {
  AdminDashboard: undefined;
  PendingDoctors: undefined;
  PendingClinics: undefined;
  AllDoctors: undefined;
  About: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={stackNavigatorScreenOptions}
      screenLayout={({ children, route }) => (
        <StackSceneLayout routeName={route.name}>{children}</StackSceneLayout>
      )}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="PendingDoctors" component={AdminPendingDoctorsScreen} />
      <Stack.Screen name="PendingClinics" component={AdminPendingClinicsScreen} />
      <Stack.Screen name="AllDoctors" component={AdminDoctorsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}
