import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TopErrorBanner } from '../../components/TopErrorBanner';
import { LoginHeroTagline } from '../../components/auth/LoginHeroTagline';
import { AppIcon, type AppIconName } from '../../components/AppIcon';
import { LoginFormCard } from '../../components/auth/LoginFormCard';
import { resolveLoginUserType } from '../../constants/testAccounts';
import { useTypography } from '../../hooks/useTypography';
import { useAuthStore } from '../../store/authStore';
import { getLoginErrorMessage, getLoginPendingRoute } from '../../utils/authErrors';
import { UI, cardShadowStyle } from '../../theme/ui';
import type { UserType } from '../../types';
import type { AuthStackParamList } from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const REGISTER_OPTIONS: {
  userType: 'DOCTOR' | 'PATIENT' | 'CLINIC';
  labelKey: 'auth.registerAsDoctor' | 'auth.registerAsPatient' | 'auth.registerAsClinic';
  icon: AppIconName;
}[] = [
  { userType: 'PATIENT', labelKey: 'auth.registerAsPatient', icon: 'profile' },
  { userType: 'DOCTOR', labelKey: 'auth.registerAsDoctor', icon: 'doctors' },
  { userType: 'CLINIC', labelKey: 'auth.registerAsClinic', icon: 'clinic' },
];

export function LoginScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const typography = useTypography();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearError = () => setErrorMessage(null);

  const handleLogin = async (override?: { email?: string; password?: string; userType?: UserType }) => {
    const loginEmail = (override?.email ?? email).trim().toLowerCase();
    const loginPassword = override?.password ?? password;

    if (!loginEmail || !loginPassword) {
      setErrorMessage(t('auth.loginError'));
      return;
    }

    clearError();

    try {
      await login({
        email: loginEmail,
        password: loginPassword,
        userType: override?.userType ?? resolveLoginUserType(loginEmail),
      });
    } catch (error) {
      const pendingRoute = getLoginPendingRoute(error);
      if (pendingRoute) {
        navigation.replace(pendingRoute);
        return;
      }

      const resolvedType = override?.userType ?? resolveLoginUserType(loginEmail);
      setErrorMessage(
        getLoginErrorMessage(error, t, resolvedType === 'ADMIN' ? 'auth.adminLoginError' : 'auth.loginError'),
      );
    }
  };

  return (
    <View className="flex-1">
      <TopErrorBanner message={errorMessage} onDismiss={clearError} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView
          contentContainerClassName="flex-grow px-6 pb-12"
          contentContainerStyle={{ paddingTop: 56 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-8 items-center pt-6">
            <LoginHeroTagline />
          </View>

          <LoginFormCard
            email={email}
            password={password}
            loading={isLoading}
            onEmailChange={(value) => {
              setEmail(value);
              clearError();
            }}
            onPasswordChange={(value) => {
              setPassword(value);
              clearError();
            }}
            onSubmit={() => void handleLogin()}
            onForgotPassword={() => navigation.navigate('ForgotPassword')}
          />

          <View className="mt-7 gap-3">
            {REGISTER_OPTIONS.map((option) => (
              <Pressable
                key={option.userType}
                onPress={() => navigation.navigate('Register', { userType: option.userType })}
                className="active:opacity-85"
                style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}
              >
                <View
                  className="flex-row items-center rounded-card border bg-white px-4 py-3.5"
                  style={{
                    borderColor: UI.border,
                    ...cardShadowStyle(),
                  }}
                >
                  <View
                    className="mr-3 h-11 w-11 items-center justify-center rounded-btn"
                    style={{ backgroundColor: UI.primaryLight }}
                  >
                    <AppIcon name={option.icon} size={22} color={UI.primary} strokeWidth={2.25} />
                  </View>
                  <Text
                    className="flex-1 text-base"
                    style={{
                      color: '#000000',
                      fontFamily: typography.fontFamilyMedium,
                      fontWeight: '600',
                    }}
                  >
                    {t(option.labelKey)}
                  </Text>
                  <Text className="text-lg font-semibold" style={{ color: UI.primary }}>
                    ›
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
