import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { ClinicTabs, type ClinicTabParamList } from './ClinicTabs';
import { AddClinicDoctorScreen } from '../screens/clinic/AddClinicDoctorScreen';
import { ClinicDoctorDetailScreen } from '../screens/clinic/ClinicDoctorDetailScreen';
import { DoctorChatScreen, type DoctorChatScreenParams } from '../screens/doctor/DoctorChatScreen';
import { EditAccountScreen } from '../screens/shared/EditAccountScreen';
import { AboutScreen } from '../screens/shared/AboutScreen';
import { mainTabsStackScreenOptions, stackNavigatorScreenOptions } from './navigationOptions';
import { StackSceneLayout } from './StackSceneLayout';

export type ClinicStackParamList = {
  MainTabs: NavigatorScreenParams<ClinicTabParamList> | undefined;
  AddDoctor: undefined;
  DoctorDetail: { doctorId: string };
  Chat: DoctorChatScreenParams;
  EditProfile: undefined;
  About: undefined;
};

const Stack = createNativeStackNavigator<ClinicStackParamList>();

export function ClinicStack() {
  return (
    <Stack.Navigator
      screenOptions={stackNavigatorScreenOptions}
      screenLayout={({ children, route }) => (
        <StackSceneLayout routeName={route.name}>{children}</StackSceneLayout>
      )}
    >
      <Stack.Screen name="MainTabs" component={ClinicTabs} options={mainTabsStackScreenOptions} />
      <Stack.Screen name="AddDoctor" component={AddClinicDoctorScreen} />
      <Stack.Screen name="DoctorDetail" component={ClinicDoctorDetailScreen} />
      <Stack.Screen name="Chat" component={DoctorChatScreen} />
      <Stack.Screen name="EditProfile" component={EditAccountScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}
