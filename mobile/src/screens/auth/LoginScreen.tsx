import { useState } from 'react';

import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { TopErrorBanner } from '../../components/TopErrorBanner';

import { AppLogo } from '../../components/AppLogo';

import { Button } from '../../components/Button';

import { Input } from '../../components/Input';

import { resolveLoginUserType } from '../../constants/testAccounts';
import { useTypography } from '../../hooks/useTypography';
import { GlassSurface } from '../../components/ui/GlassSurface';

import { useAuthStore } from '../../store/authStore';

import { getLoginErrorMessage, getLoginPendingRoute } from '../../utils/authErrors';

import type { UserType } from '../../types';

import type { AuthStackParamList } from '../../navigation/AuthStack';



type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;



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

        <ScrollView contentContainerClassName="flex-grow px-6 pb-10 pt-14" keyboardShouldPersistTaps="handled">

          <View className="mb-8 items-center">

            <AppLogo size={80} />

            <Text className="mt-4 text-center text-base text-on-sky-muted">{t('auth.loginSubtitle')}</Text>

          </View>



          <GlassSurface className="rounded-card p-6">

            <Text

              className="mb-5 text-xl text-heading"

              style={{ fontFamily: typography.fontFamily, fontWeight: typography.headingWeight }}

            >

              {t('auth.login')}

            </Text>

            <Input

              label={t('auth.email')}

              value={email}

              onChangeText={(value) => {

                setEmail(value);

                clearError();

              }}

              keyboardType="email-address"

              autoCapitalize="none"

              autoComplete="email"

            />

            <Input

              label={t('auth.password')}

              value={password}

              onChangeText={(value) => {

                setPassword(value);

                clearError();

              }}

              secureTextEntry

              autoComplete="password"

              onSubmitEditing={() => void handleLogin()}

              returnKeyType="go"

            />

            <Button title={t('auth.login')} loading={isLoading} onPress={() => void handleLogin()} className="mt-1" />

          </GlassSurface>



          <View className="mt-6 items-center gap-3">

            {(['DOCTOR', 'PATIENT', 'CLINIC'] as const).map((userType) => (

              <Pressable key={userType} onPress={() => navigation.navigate('Register', { userType })}>

                <Text className="text-sm font-semibold text-primary">

                  {t(

                    userType === 'DOCTOR'

                      ? 'auth.registerAsDoctor'

                      : userType === 'PATIENT'

                        ? 'auth.registerAsPatient'

                        : 'auth.registerAsClinic',

                  )}

                </Text>

              </Pressable>

            ))}

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </View>

  );

}


