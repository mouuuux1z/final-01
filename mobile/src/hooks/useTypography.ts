import { useTranslation } from 'react-i18next';
import { getTypography, type AppTypography } from '../theme/ui';

export function useTypography(): AppTypography {
  const { i18n } = useTranslation();
  return getTypography(i18n.language);
}
