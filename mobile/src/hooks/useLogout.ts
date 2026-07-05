import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { confirmAlert } from '../utils/alert';

export function useLogout() {
  const { t } = useTranslation();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = useCallback(async () => {
    const confirmed = await confirmAlert(
      t('common.logout'),
      t('auth.logoutConfirm'),
      t('common.logout'),
      t('common.cancel'),
    );
    if (confirmed) {
      await logout();
    }
  }, [logout, t]);

  return { handleLogout };
}
