import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { DoctorPendingScreen } from '../screens/auth/DoctorPendingScreen';
import { ClinicPendingScreen } from '../screens/auth/ClinicPendingScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { stackNavigatorScreenOptions } from './navigationOptions';
import { StackSceneLayout } from './StackSceneLayout';

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: { userType: 'PATIENT' | 'DOCTOR' | 'CLINIC' };
  DoctorPending: undefined;
  ClinicPending: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

interface AuthStackProps {
  initialRouteName?: keyof AuthStackParamList;
}

export function AuthStack({ initialRouteName = 'Login' }: AuthStackProps) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={stackNavigatorScreenOptions}
      screenLayout={({ children, route }) => (
        <StackSceneLayout routeName={route.name}>{children}</StackSceneLayout>
      )}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="DoctorPending" component={DoctorPendingScreen} />
      <Stack.Screen name="ClinicPending" component={ClinicPendingScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
