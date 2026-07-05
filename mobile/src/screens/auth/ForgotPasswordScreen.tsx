import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PlaceholderScreen } from '../placeholders';
import type { AuthStackParamList } from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { t } = useTranslation();

  return (
    <View className="flex-1">
      <View className="px-6 pt-14">
        <Pressable onPress={() => navigation.goBack()} className="mb-4">
          <Text className="text-base font-medium text-primary">{t('common.back')}</Text>
        </Pressable>
      </View>
      <PlaceholderScreen subtitleKey="auth.forgotSubtitle" />
    </View>
  );
}
