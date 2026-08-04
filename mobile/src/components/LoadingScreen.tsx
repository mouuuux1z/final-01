import { Text, View } from 'react-native';
import { AppLoader } from './AppLoader';
import { useTranslation } from 'react-i18next';
import { AppLogo } from './AppLogo';
import { UI } from '../theme/ui';
import { useTypography } from '../hooks/useTypography';

export function LoadingScreen() {
  const { t } = useTranslation();
  const typography = useTypography();

  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'transparent' }}>
      <AppLogo size={72} />
      <AppLoader size="large" color={UI.primary} className="mt-6" />
      <Text
        className="mt-4 text-sm text-body"
        style={{ fontFamily: typography.fontFamilyRegular, fontWeight: typography.bodyWeight }}
      >
        {t('common.loading')}
      </Text>
    </View>
  );
}
