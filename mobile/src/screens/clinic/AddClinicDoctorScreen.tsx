import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { CertificateUploadField } from '../../components/ui/CertificateUploadField';
import { api, getApiErrorMessage } from '../../services/api';
import { showAlert } from '../../utils/alert';
import { appendFileToFormData, pickCertificateFile, type PickedFile } from '../../utils/filePicker';
import type { ClinicStackParamList } from '../../navigation/ClinicStack';

type Props = NativeStackScreenProps<ClinicStackParamList, 'AddDoctor'>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AddClinicDoctorScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [certificate, setCertificate] = useState<PickedFile | null>(null);

  const createMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('email', email.trim());
      formData.append('password', password);
      formData.append('phone', phone.trim());
      formData.append('specialization', specialization.trim());
      formData.append('city', city.trim());
      formData.append('location', location.trim());
      if (description.trim()) {
        formData.append('description', description.trim());
      }
      appendFileToFormData(formData, 'certificate', certificate!);
      await api.post('/clinics/me/doctors', formData);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['clinic'] });
      showAlert(t('common.success'), t('clinic.doctorCreated'));
      navigation.goBack();
    },
    onError: (error) => showAlert(t('common.error'), getApiErrorMessage(error)),
  });

  const handlePickCertificate = async () => {
    const file = await pickCertificateFile();
    if (file) setCertificate(file);
  };

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !password || !phone.trim() || !specialization.trim() || !city.trim() || !location.trim()) {
      showAlert(t('common.error'), t('clinic.fillRequiredFields'));
      return;
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      showAlert(t('common.error'), t('auth.errors.emailRequired'));
      return;
    }
    if (password.length < 8) {
      showAlert(t('common.error'), t('auth.errors.passwordMin'));
      return;
    }
    if (!certificate) {
      showAlert(t('common.error'), t('auth.errors.certificateRequired'));
      return;
    }
    createMutation.mutate();
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerClassName="pb-10">
        <View className="bg-primary px-6 pb-8 pt-14">
          <Pressable onPress={() => navigation.goBack()} className="mb-4 self-start">
            <Text className="text-sm font-medium text-white">{t('common.back')}</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-white">{t('clinic.addDoctor')}</Text>
          <Text className="mt-1 text-sm text-blue-100">{t('clinic.addDoctorHint')}</Text>
        </View>

        <View className="px-6 pt-6">
          <Input label={t('auth.name')} value={name} onChangeText={setName} />
          <Input label={t('auth.email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Input label={t('auth.password')} value={password} onChangeText={setPassword} secureTextEntry />
          <Input label={t('auth.phone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder={t('auth.phoneHint')} />
          <Input label={t('auth.specialization')} value={specialization} onChangeText={setSpecialization} />
          <Input label={t('auth.city')} value={city} onChangeText={setCity} />
          <Input label={t('auth.location')} value={location} onChangeText={setLocation} />
          <Input
            label={t('doctor.about')}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
          <CertificateUploadField
            certificate={certificate}
            onPick={() => void handlePickCertificate()}
          />
          <Button
            title={t('clinic.createDoctor')}
            onPress={handleSubmit}
            loading={createMutation.isPending}
            className="mt-4"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
