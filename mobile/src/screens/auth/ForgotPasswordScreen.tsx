import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { TopErrorBanner } from '../../components/TopErrorBanner';
import { requestPasswordReset } from '../../services/authApi';
import { getApiErrorMessage } from '../../services/api';
import { useTypography } from '../../hooks/useTypography';
import type { AuthStackParamList } from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
  const typography = useTypography();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setErrorMessage(t('auth.errors.emailRequired'));
      return;
    }
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setErrorMessage(t('auth.errors.emailInvalid'));
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await requestPasswordReset(normalizedEmail, i18n.language);
      setSuccessMessage(t('auth.resetCodeSent'));
      setTimeout(() => {
        navigation.navigate('ResetPassword', { email: normalizedEmail });
      }, 700);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, t('auth.resetRequestError')));
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
            {t('auth.forgotPassword')}
          </Text>
          <Text
            className="mb-6 text-base"
            style={{ fontFamily: typography.fontFamily, color: '#666666' }}
          >
            {t('auth.forgotPasswordHint')}
          </Text>

          {successMessage ? (
            <View className="mb-4 rounded-card border border-green-200 bg-green-50 px-4 py-3">
              <Text style={{ fontFamily: typography.fontFamily, color: '#166534' }}>{successMessage}</Text>
            </View>
          ) : null}

          <Input
            label={t('auth.email')}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setErrorMessage(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Button
            title={t('auth.sendResetCode')}
            loading={loading}
            onPress={() => void handleSubmit()}
            className="mt-4"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
