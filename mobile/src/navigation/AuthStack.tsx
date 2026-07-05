import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { DoctorPendingScreen } from '../screens/auth/DoctorPendingScreen';
import { ClinicPendingScreen } from '../screens/auth/ClinicPendingScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { stackNavigatorScreenOptions } from './navigationOptions';
import { StackSceneLayout } from './StackSceneLayout';

export type AuthStackParamList = {
  Login: undefined;
  Register: { userType: 'PATIENT' | 'DOCTOR' | 'CLINIC' };
  DoctorPending: undefined;
  ClinicPending: undefined;
  ForgotPassword: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={stackNavigatorScreenOptions}
      screenLayout={({ children, route }) => (
        <StackSceneLayout routeName={route.name}>{children}</StackSceneLayout>
      )}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="DoctorPending" component={DoctorPendingScreen} />
      <Stack.Screen name="ClinicPending" component={ClinicPendingScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}
