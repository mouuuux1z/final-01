import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { CertificateUploadField } from '../../components/ui/CertificateUploadField';
import { SpecializationPicker } from '../../components/SpecializationPicker';
import { TopErrorBanner } from '../../components/TopErrorBanner';
import { useAuthStore } from '../../store/authStore';
import {
  mapRegisterApiError,
  type RegisterFieldErrors,
  type RegisterFieldName,
} from '../../utils/authErrors';
import { pickCertificateFile, type PickedFile } from '../../utils/filePicker';
import type { AuthStackParamList } from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;
type RegisterRole = 'PATIENT' | 'DOCTOR' | 'CLINIC';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const register = useAuthStore((s) => s.register);
  const registerDoctor = useAuthStore((s) => s.registerDoctor);
  const registerClinic = useAuthStore((s) => s.registerClinic);
  const isLoading = useAuthStore((s) => s.isLoading);
  const clearError = useAuthStore((s) => s.clearError);
  const scrollRef = useRef<ScrollView>(null);

  const userType: RegisterRole = route.params?.userType ?? 'PATIENT';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [certificate, setCertificate] = useState<PickedFile | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const titleKey =
    userType === 'DOCTOR'
      ? 'auth.registerDoctorTitle'
      : userType === 'CLINIC'
        ? 'auth.registerClinicTitle'
        : 'auth.registerPatientTitle';

  const clearFieldError = (field: RegisterFieldName) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setFormError(null);
  };

  const validateForm = (): RegisterFieldErrors => {
    const errors: RegisterFieldErrors = {};

    if (!name.trim()) errors.name = t('auth.errors.nameRequired');
    if (!email.trim()) {
      errors.email = t('auth.errors.emailRequired');
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      errors.email = t('auth.errors.emailInvalid');
    }
    if (phone.trim().length < 8) errors.phone = t('auth.errors.phoneRequired');
    if (password.length < 8) errors.password = t('auth.errors.passwordMin');
    if (!confirmPassword) {
      errors.confirmPassword = t('auth.errors.confirmPasswordRequired');
    } else if (password !== confirmPassword) {
      errors.confirmPassword = t('auth.errors.passwordMismatch');
    }

    if (userType === 'DOCTOR') {
      if (!specialization.trim()) errors.specialization = t('auth.errors.specializationRequired');
      if (!city.trim()) errors.city = t('auth.errors.cityRequired');
      if (!location.trim()) errors.location = t('auth.errors.locationRequired');
      if (!certificate) errors.certificate = t('auth.errors.certificateRequired');
    }

    if (userType === 'CLINIC') {
      if (!specialization.trim()) errors.specialization = t('auth.errors.specializationRequired');
      if (!city.trim()) errors.city = t('auth.errors.cityRequired');
      if (!location.trim()) errors.location = t('auth.errors.locationRequired');
      if (!certificate) errors.certificate = t('auth.errors.certificateRequired');
    }

    return errors;
  };

  const handlePickCertificate = async () => {
    const file = await pickCertificateFile();
    if (file) {
      setCertificate(file);
      clearFieldError('certificate');
    }
  };

  const handleRegister = async () => {
    clearError();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setFormError(t('auth.errors.fixForm'));
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setFieldErrors({});
    setFormError(null);

    try {
      let result: { pendingApproval: boolean };

      if (userType === 'DOCTOR') {
        result = await registerDoctor({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim(),
          specialization: specialization.trim(),
          city: city.trim(),
          location: location.trim(),
          certificate: certificate!,
        });
      } else if (userType === 'CLINIC') {
        result = await registerClinic({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim(),
          city: city.trim(),
          location: location.trim(),
          specialization: specialization.trim(),
          certificate: certificate!,
        });
      } else {
        result = await register({
          userType,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim(),
        });
      }

      if (result.pendingApproval) {
        navigation.replace(userType === 'CLINIC' ? 'ClinicPending' : 'DoctorPending');
      }
    } catch (error) {
      const { fieldErrors: apiFieldErrors, formError: apiFormError } = mapRegisterApiError(error, t);
      setFieldErrors(apiFieldErrors);
      setFormError(apiFormError);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  return (
    <View className="flex-1">
      <TopErrorBanner message={formError} onDismiss={() => setFormError(null)} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          ref={scrollRef}
          contentContainerClassName="flex-grow px-6 pb-10 pt-12"
          keyboardShouldPersistTaps="handled"
        >
        <Pressable onPress={() => navigation.goBack()} className="mb-4 self-start">
          <Text className="text-base font-medium text-primary">{t('common.back')}</Text>
        </Pressable>

        <Text className="mb-2 text-3xl font-bold text-slate-900">{t(titleKey)}</Text>
        <Text className="mb-6 text-base text-slate-500">{t('auth.registerSubtitle')}</Text>

        {userType === 'DOCTOR' || userType === 'CLINIC' ? (
          <View className="mb-4 rounded-card border border-amber-200 bg-amber-50 px-4 py-3">
            <Text className="text-sm text-amber-800">{t('auth.doctorApprovalNotice')}</Text>
          </View>
        ) : null}

        <Input
          label={t('auth.name')}
          value={name}
          onChangeText={(value) => {
            setName(value);
            clearFieldError('name');
          }}
          autoCapitalize="words"
          error={fieldErrors.name}
        />
        <Input
          label={t('auth.email')}
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            clearFieldError('email');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          error={fieldErrors.email}
        />
        <Input
          label={t('auth.phone')}
          value={phone}
          onChangeText={(value) => {
            setPhone(value);
            clearFieldError('phone');
          }}
          keyboardType="phone-pad"
          placeholder={t('auth.phoneHint')}
          error={fieldErrors.phone}
        />
        {userType === 'DOCTOR' || userType === 'CLINIC' ? (
          <>
            <SpecializationPicker
              value={specialization}
              onChange={(value) => {
                setSpecialization(value);
                clearFieldError('specialization');
              }}
              error={fieldErrors.specialization}
            />
            <Input
              label={t('auth.city')}
              value={city}
              onChangeText={(value) => {
                setCity(value);
                clearFieldError('city');
              }}
              error={fieldErrors.city}
            />
            {userType === 'DOCTOR' || userType === 'CLINIC' ? (
              <Input
                label={t('auth.location')}
                value={location}
                onChangeText={(value) => {
                  setLocation(value);
                  clearFieldError('location');
                }}
                error={fieldErrors.location}
              />
            ) : null}
            <CertificateUploadField
              certificate={certificate}
              onPick={() => void handlePickCertificate()}
              error={fieldErrors.certificate}
            />
          </>
        ) : null}
        <Input
          label={t('auth.password')}
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            clearFieldError('password');
          }}
          secureTextEntry
          error={fieldErrors.password}
        />
        <Input
          label={t('auth.confirmPassword')}
          value={confirmPassword}
          onChangeText={(value) => {
            setConfirmPassword(value);
            clearFieldError('confirmPassword');
          }}
          secureTextEntry
          error={fieldErrors.confirmPassword}
        />

        <Button title={t('auth.register')} loading={isLoading} onPress={() => void handleRegister()} className="mt-2" />

        <View className="mt-8 flex-row items-center justify-center">
          <Text className="text-slate-500">{t('auth.hasAccount')} </Text>
          <Pressable
            onPress={() => navigation.navigate('Login')}
            className={Platform.OS === 'web' ? 'cursor-pointer' : undefined}
          >
            <Text className="font-semibold text-primary">{t('auth.signIn')}</Text>
          </Pressable>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
