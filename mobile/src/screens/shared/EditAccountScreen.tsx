import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { BackButton } from '../../components/BackButton';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { SpecializationPicker } from '../../components/SpecializationPicker';
import { TopErrorBanner } from '../../components/TopErrorBanner';
import { matchSpecialtyValue } from '../../constants/specialties';
import { getApiErrorMessage } from '../../services/api';
import {
  updateClinicProfile,
  updateDoctorProfile,
  updatePatientProfile,
} from '../../services/profileApi';
import { useAuthStore } from '../../store/authStore';
import { showAlert } from '../../utils/alert';
import { UI } from '../../theme/ui';
import type { ClinicUser, DoctorUser, PatientUser, UserType } from '../../types';

type FieldKey =
  | 'name'
  | 'phone'
  | 'specialization'
  | 'city'
  | 'location'
  | 'clinicInfo'
  | 'description';

export function EditAccountScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const userType = useAuthStore((s) => s.userType);
  const mergeUserProfile = useAuthStore((s) => s.mergeUserProfile);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [clinicInfo, setClinicInfo] = useState('');
  const [description, setDescription] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !userType) return;
    setName(user.name ?? '');
    if (userType === 'PATIENT') {
      setPhone((user as PatientUser).phone ?? '');
    }
    if (userType === 'DOCTOR') {
      const doctor = user as DoctorUser;
      setPhone(doctor.phone ?? '');
      setSpecialization(matchSpecialtyValue(doctor.specialization ?? ''));
      setCity(doctor.city ?? '');
      setLocation(doctor.location ?? '');
      setClinicInfo(doctor.clinicInfo ?? '');
      setDescription(doctor.description ?? '');
    }
    if (userType === 'CLINIC') {
      const clinic = user as ClinicUser;
      setPhone(clinic.phone ?? '');
      setCity(clinic.city ?? '');
      setSpecialization(matchSpecialtyValue(clinic.specialization ?? ''));
      setLocation(clinic.location ?? '');
    }
  }, [user, userType]);

  const email = user?.email ?? '';

  const title = useMemo(() => {
    if (userType === 'DOCTOR') return t('profile.editProfile');
    if (userType === 'CLINIC') return t('profile.editClinicProfile');
    return t('profile.editProfile');
  }, [t, userType]);

  const validate = (): Partial<Record<FieldKey, string>> => {
    const errors: Partial<Record<FieldKey, string>> = {};
    if (!name.trim()) errors.name = t('auth.errors.nameRequired');
    if (phone.trim().length < 8) errors.phone = t('auth.errors.phoneRequired');

    if (userType === 'DOCTOR') {
      if (!specialization.trim()) errors.specialization = t('auth.errors.specializationRequired');
      if (!city.trim()) errors.city = t('auth.errors.cityRequired');
      if (!location.trim()) errors.location = t('auth.errors.locationRequired');
    }

    if (userType === 'CLINIC') {
      if (!location.trim()) errors.location = t('auth.errors.locationRequired');
      if (!city.trim()) errors.city = t('auth.errors.cityRequired');
      if (!specialization.trim()) errors.specialization = t('auth.errors.specializationRequired');
    }

    return errors;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!userType) throw new Error('Not authenticated');

      if (userType === 'PATIENT') {
        return updatePatientProfile({ name: name.trim(), phone: phone.trim() });
      }
      if (userType === 'DOCTOR') {
        return updateDoctorProfile({
          name: name.trim(),
          phone: phone.trim(),
          specialization: specialization.trim(),
          city: city.trim(),
          location: location.trim(),
          clinicInfo: clinicInfo.trim() || undefined,
          description: description.trim() || undefined,
        });
      }
      return updateClinicProfile({
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim(),
        city: city.trim(),
        specialization: specialization.trim(),
      });
    },
    onSuccess: (profile) => {
      mergeUserProfile(profile);
      showAlert(t('common.success'), t('profile.profileUpdated'));
      navigation.goBack();
    },
    onError: (error) => {
      setFormError(getApiErrorMessage(error, t('profile.updateFailed')));
    },
  });

  const handleSave = () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError(t('auth.errors.fixForm'));
      return;
    }
    setFieldErrors({});
    setFormError(null);
    saveMutation.mutate();
  };

  const clearFieldError = (field: FieldKey) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setFormError(null);
  };

  if (!user || !userType || !(['PATIENT', 'DOCTOR', 'CLINIC'] as UserType[]).includes(userType)) {
    return null;
  }

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerClassName="pb-10" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-14">
          <BackButton onPress={() => navigation.goBack()} />
          <Text className="text-2xl font-bold" style={{ color: UI.text.primary }}>
            {title}
          </Text>
          <Text className="mt-1 text-sm" style={{ color: UI.text.secondary }}>
            {t('profile.editAccountHint')}
          </Text>
        </View>

        <View className="px-6 pt-4">
          {formError ? <TopErrorBanner message={formError} /> : null}

          <Input
            label={t('auth.name')}
            value={name}
            onChangeText={(value) => {
              setName(value);
              clearFieldError('name');
            }}
            error={fieldErrors.name}
          />
          <Input label={t('auth.email')} value={email} editable={false} />
          <Text className="-mt-2 mb-4 text-xs" style={{ color: UI.text.muted }}>
            {t('profile.emailReadOnly')}
          </Text>
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

          {userType === 'DOCTOR' ? (
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
              <Input
                label={t('doctor.location')}
                value={location}
                onChangeText={(value) => {
                  setLocation(value);
                  clearFieldError('location');
                }}
                error={fieldErrors.location}
              />
              <Input
                label={t('profile.clinicInfo')}
                value={clinicInfo}
                onChangeText={setClinicInfo}
                multiline
                numberOfLines={3}
              />
              <Input
                label={t('doctor.about')}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </>
          ) : null}

          {userType === 'CLINIC' ? (
            <>
              <Input
                label={t('clinic.location')}
                value={location}
                onChangeText={(value) => {
                  setLocation(value);
                  clearFieldError('location');
                }}
                error={fieldErrors.location}
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
              <SpecializationPicker
                value={specialization}
                onChange={(value) => {
                  setSpecialization(value);
                  clearFieldError('specialization');
                }}
                error={fieldErrors.specialization}
              />
            </>
          ) : null}

          <Button
            title={t('common.save')}
            onPress={handleSave}
            loading={saveMutation.isPending}
            className="mt-2"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
