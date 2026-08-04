import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { TopErrorBanner } from '../../components/TopErrorBanner';
import { resetPassword } from '../../services/authApi';
import { getApiErrorMessage } from '../../services/api';
import { showAlert } from '../../utils/alert';
import { useTypography } from '../../hooks/useTypography';
import type { AuthStackParamList } from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const typography = useTypography();
  const email = route.params.email;
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!/^\d{6}$/.test(code.trim())) {
      setErrorMessage(t('auth.resetCodeInvalid'));
      return;
    }
    if (password.length < 8) {
      setErrorMessage(t('auth.errors.passwordMin'));
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(t('auth.errors.passwordMismatch'));
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await resetPassword({ email, code: code.trim(), password });
      showAlert(t('common.success'), t('auth.resetPasswordSuccess'));
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, t('auth.resetPasswordError')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1">
      <TopErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView
          contentContainerClassName="flex-grow px-6 pb-12"
          contentContainerStyle={{ paddingTop: 56 }}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => navigation.goBack()} className="mb-6 self-start">
            <Text className="text-base font-medium text-primary">{t('common.back')}</Text>
          </Pressable>

          <Text
            className="mb-2 text-2xl"
            style={{ fontFamily: typography.fontFamily, fontWeight: typography.headingWeight, color: '#1089D3' }}
          >
            {t('auth.resetPasswordTitle')}
          </Text>
          <Text
            className="mb-4 text-base"
            style={{ fontFamily: typography.fontFamily, color: '#666666' }}
          >
            {t('auth.resetPasswordHint', { email })}
          </Text>

          <View className="mb-4 rounded-card border border-amber-200 bg-amber-50 px-4 py-3">
            <Text
              className="text-sm leading-6"
              style={{ fontFamily: typography.fontFamily, color: '#92400E' }}
            >
              {t('auth.resetCodeSpamHint')}
            </Text>
          </View>

          <Input
            label={t('auth.resetCode')}
            value={code}
            onChangeText={(value) => {
              setCode(value.replace(/\D/g, '').slice(0, 6));
              setErrorMessage(null);
            }}
            keyboardType="number-pad"
            autoComplete="one-time-code"
          />

          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setErrorMessage(null);
            }}
            secureTextEntry
            autoComplete="new-password"
          />

          <Input
            label={t('auth.confirmPassword')}
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              setErrorMessage(null);
            }}
            secureTextEntry
            autoComplete="new-password"
          />

          <Button
            title={t('auth.resetPasswordAction')}
            loading={loading}
            onPress={() => void handleSubmit()}
            className="mt-4"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
