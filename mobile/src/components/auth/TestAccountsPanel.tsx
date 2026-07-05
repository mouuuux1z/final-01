import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../AppIcon';
import { DEMO_ACCOUNTS, TEST_PASSWORD } from '../../constants/testAccounts';
import { UI, cardShadowStyle } from '../../theme/ui';
import { useTypography } from '../../hooks/useTypography';
import type { UserType } from '../../types';

interface TestAccountsPanelProps {
  loading?: boolean;
  onSelect: (email: string, userType?: UserType) => void;
}

export function TestAccountsPanel({ loading, onSelect }: TestAccountsPanelProps) {
  const { t } = useTranslation();
  const typography = useTypography();

  return (
    <View className="mt-6 rounded-card bg-medical-card p-5" style={cardShadowStyle()}>
      <Text
        className="mb-1 text-sm text-heading"
        style={{ fontFamily: typography.fontFamily, fontWeight: typography.headingWeight }}
      >
        {t('auth.testAccounts')}
      </Text>
      <Text className="mb-4 text-xs leading-5 text-body">
        {t('auth.testAccountsHint', { password: TEST_PASSWORD })}
      </Text>

      <View className="gap-3">
        {DEMO_ACCOUNTS.map((account) => (
          <Pressable
            key={account.email}
            onPress={() => onSelect(account.email, account.userType === 'CLINIC' || account.userType === 'ADMIN' ? account.userType : undefined)}
            disabled={loading}
            className="flex-row items-center gap-3 rounded-card px-4 py-3 active:opacity-90"
            style={{ backgroundColor: UI.input }}
          >
            <View className="h-10 w-10 items-center justify-center rounded-pill bg-medical-card">
              <AppIcon name={account.icon} size={20} color={UI.primary} strokeWidth={2.25} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-heading">{t(account.labelKey)}</Text>
              <Text className="mt-0.5 text-xs text-body" numberOfLines={1}>
                {account.email}
              </Text>
              <Text className="mt-0.5 text-[11px] text-body" numberOfLines={1}>
                {t(account.hintKey)}
              </Text>
            </View>
            {loading ? (
              <ActivityIndicator size="small" color={UI.primary} />
            ) : (
              <Text className="text-xs font-semibold text-primary">{t('auth.testQuickLogin')}</Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}
