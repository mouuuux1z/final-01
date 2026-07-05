import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DoctorTabs } from './DoctorTabs';
import { DoctorChatScreen, type DoctorChatScreenParams } from '../screens/doctor/DoctorChatScreen';
import { EditAccountScreen } from '../screens/shared/EditAccountScreen';
import { AboutScreen } from '../screens/shared/AboutScreen';
import { mainTabsStackScreenOptions, stackNavigatorScreenOptions } from './navigationOptions';
import { StackSceneLayout } from './StackSceneLayout';

export type DoctorRootStackParamList = {
  MainTabs: undefined;
  Chat: DoctorChatScreenParams;
  EditProfile: undefined;
  About: undefined;
};

const Stack = createNativeStackNavigator<DoctorRootStackParamList>();

export function DoctorRootStack() {
  return (
    <Stack.Navigator
      screenOptions={stackNavigatorScreenOptions}
      screenLayout={({ children, route }) => (
        <StackSceneLayout routeName={route.name}>{children}</StackSceneLayout>
      )}
    >
      <Stack.Screen name="MainTabs" component={DoctorTabs} options={mainTabsStackScreenOptions} />
      <Stack.Screen name="Chat" component={DoctorChatScreen} />
      <Stack.Screen name="EditProfile" component={EditAccountScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}
