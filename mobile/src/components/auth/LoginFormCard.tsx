import { useState } from 'react';
import {
  ActivityIndicator,
  I18nManager,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useTypography } from '../../hooks/useTypography';

const CARD_GRADIENT = ['#FFFFFF', '#F4F7FB'] as const;
const BUTTON_GRADIENT = ['#1089D3', '#12B1D1'] as const;

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: 'rgba(133, 189, 215, 0.88)',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
  android: { elevation: 16 },
  default: {
    boxShadow: 'rgba(133, 189, 215, 0.88) 0px 30px 30px -20px',
  },
});

const INPUT_SHADOW = Platform.select({
  ios: {
    shadowColor: '#cff0ff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  android: { elevation: 4 },
  default: {
    boxShadow: '#cff0ff 0px 10px 10px -5px',
  },
});

interface LoginFormCardProps {
  email: string;
  password: string;
  loading?: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onForgotPassword: () => void;
}

function LoginInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoComplete,
  onSubmitEditing,
  returnKeyType,
  isRtl,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'email-address' | 'default';
  autoCapitalize?: 'none';
  autoComplete?: 'email' | 'password';
  onSubmitEditing?: () => void;
  returnKeyType?: 'go' | 'done';
  isRtl: boolean;
}) {
  const typography = useTypography();
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#AAAAAA"
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoComplete={autoComplete}
      onSubmitEditing={onSubmitEditing}
      returnKeyType={returnKeyType}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.input,
        INPUT_SHADOW,
        {
          fontFamily: typography.fontFamily,
          textAlign: isRtl ? 'right' : 'left',
          writingDirection: isRtl ? 'rtl' : 'ltr',
        },
        focused && styles.inputFocused,
      ]}
    />
  );
}

export function LoginFormCard({
  email,
  password,
  loading = false,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onForgotPassword,
}: LoginFormCardProps) {
  const { t, i18n } = useTranslation();
  const typography = useTypography();
  const isRtl = I18nManager.isRTL || i18n.language === 'ar';

  return (
    <View style={[styles.cardOuter, CARD_SHADOW]}>
      <LinearGradient colors={[...CARD_GRADIENT]} style={styles.card}>
        <Text
          style={[
            styles.heading,
            {
              fontFamily: typography.fontFamily,
            },
          ]}
        >
          {t('auth.login')}
        </Text>

        <View style={styles.form}>
          <LoginInput
            value={email}
            onChangeText={onEmailChange}
            placeholder={t('auth.email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            isRtl={isRtl}
          />

          <LoginInput
            value={password}
            onChangeText={onPasswordChange}
            placeholder={t('auth.password')}
            secureTextEntry
            autoComplete="password"
            onSubmitEditing={onSubmit}
            returnKeyType="go"
            isRtl={isRtl}
          />

          <Pressable
            onPress={onForgotPassword}
            style={[styles.forgotPassword, isRtl ? styles.forgotPasswordRtl : styles.forgotPasswordLtr]}
          >
            <Text style={[styles.forgotPasswordText, { fontFamily: typography.fontFamily }]}>
              {t('auth.forgotPassword')}
            </Text>
          </Pressable>

          <Pressable
            disabled={loading}
            onPress={onSubmit}
            style={({ pressed }) => [
              styles.loginButtonWrap,
              Platform.select({
                ios: {
                  shadowColor: 'rgba(133, 189, 215, 0.88)',
                  shadowOffset: { width: 0, height: 20 },
                  shadowOpacity: 1,
                  shadowRadius: 10,
                },
                android: { elevation: 10 },
                default: {
                  boxShadow: 'rgba(133, 189, 215, 0.88) 0px 20px 10px -15px',
                },
              }),
              (pressed || loading) && styles.loginButtonPressed,
            ]}
          >
            <LinearGradient colors={[...BUTTON_GRADIENT]} style={styles.loginButton}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={[styles.loginButtonText, { fontFamily: typography.fontFamilyMedium }]}>
                  {t('auth.login')}
                </Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 350,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  card: {
    paddingHorizontal: 35,
    paddingVertical: 25,
  },
  heading: {
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 30,
    color: '#1089D3',
  },
  form: {
    marginTop: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
    marginTop: 15,
    fontSize: 16,
    color: '#1A1A1A',
  },
  inputFocused: {
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderLeftColor: '#12B1D1',
    borderRightColor: '#12B1D1',
  },
  forgotPassword: {
    marginTop: 10,
  },
  forgotPasswordLtr: {
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  forgotPasswordRtl: {
    alignSelf: 'flex-end',
    marginRight: 10,
  },
  forgotPasswordText: {
    fontSize: 11,
    color: '#0099FF',
  },
  loginButtonWrap: {
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  loginButtonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.95,
  },
  loginButton: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    minHeight: 52,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
