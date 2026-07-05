import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppIcon } from '../../components/AppIcon';
import { Button } from '../../components/Button';
import type { AuthStackParamList } from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'ClinicPending'>;

export function ClinicPendingScreen({ navigation }: Props) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-amber-50">
        <AppIcon name="pending" size={40} color="#F59E0B" strokeWidth={2} />
      </View>
      <Text className="mb-3 text-center text-2xl font-bold text-slate-900">{t('auth.clinicPendingTitle')}</Text>
      <Text className="mb-8 text-center text-base leading-6 text-slate-600">{t('auth.clinicPendingMessage')}</Text>
      <Button
        title={t('auth.backToLogin')}
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
        className="w-full"
      />
      <Pressable onPress={() => navigation.navigate('Login')} className="mt-4 py-2">
        <Text className="text-sm text-primary">{t('auth.patientLoginInstead')}</Text>
      </Pressable>
    </View>
  );
}
