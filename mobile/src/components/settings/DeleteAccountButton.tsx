import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppModal, appModalStyles } from '../AppModal';
import { Button } from '../Button';
import { Input } from '../Input';
import { TopErrorBanner } from '../TopErrorBanner';
import { deleteAccount } from '../../services/authApi';
import { getApiErrorMessage } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { confirmAlert } from '../../utils/alert';
import { showAlert } from '../../utils/alert';
import { UI } from '../../theme/ui';
import { useTypography } from '../../hooks/useTypography';

interface DeleteAccountButtonProps {
  className?: string;
}

export function DeleteAccountButton({ className }: DeleteAccountButtonProps) {
  const { t } = useTranslation();
  const typography = useTypography();
  const logout = useAuthStore((s) => s.logout);
  const [modalVisible, setModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetModal = () => {
    setModalVisible(false);
    setPassword('');
    setErrorMessage(null);
    setLoading(false);
  };

  const handleOpen = async () => {
    const confirmed = await confirmAlert(
      t('profile.deleteAccount'),
      t('profile.deleteAccountConfirm'),
      t('profile.deleteAccountContinue'),
      t('common.cancel'),
    );
    if (confirmed) {
      setModalVisible(true);
    }
  };

  const handleDelete = async () => {
    if (!password.trim()) {
      setErrorMessage(t('auth.errors.passwordRequired'));
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await deleteAccount(password);
      resetModal();
      await logout();
      showAlert(t('common.success'), t('profile.deleteAccountSuccess'));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, t('profile.deleteAccountFailed')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopErrorBanner message={errorMessage && !modalVisible ? errorMessage : null} onDismiss={() => setErrorMessage(null)} />

      <View className={className}>
        <Text className="mb-2 text-sm" style={{ color: UI.text.secondary, fontFamily: typography.fontFamily }}>
          {t('profile.deleteAccountHint')}
        </Text>
        <Button title={t('profile.deleteAccount')} variant="danger" onPress={() => void handleOpen()} />
      </View>

      <AppModal visible={modalVisible} onRequestClose={resetModal} onBackdropPress={resetModal}>
        <View style={appModalStyles.body} className="px-6 pt-6">
          <Text className="mb-4 text-lg font-bold text-slate-900">{t('profile.deleteAccountPasswordTitle')}</Text>
          <ScrollView
            style={appModalStyles.scroll}
            contentContainerStyle={appModalStyles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text className="mb-4 text-sm leading-6 text-slate-600">{t('profile.deleteAccountPasswordHint')}</Text>
            {errorMessage ? (
              <View className="mb-4 rounded-card border border-red-200 bg-red-50 px-4 py-3">
                <Text className="text-sm text-red-700">{errorMessage}</Text>
              </View>
            ) : null}
            <Input
              label={t('auth.password')}
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setErrorMessage(null);
              }}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
            />
            <View className="mt-4 gap-3">
              <Button
                title={t('profile.deleteAccountPermanently')}
                variant="danger"
                loading={loading}
                onPress={() => void handleDelete()}
              />
              <Button title={t('common.cancel')} variant="outline" onPress={resetModal} disabled={loading} />
            </View>
          </ScrollView>
        </View>
      </AppModal>
    </>
  );
}
