import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../AppIcon';
import { useTypography } from '../../hooks/useTypography';
import { UI, glassSurfaceStyle } from '../../theme/ui';
import type { PickedFile } from '../../utils/filePicker';

interface CertificateUploadFieldProps {
  certificate: PickedFile | null;
  onPick: () => void;
  error?: string;
}

export function CertificateUploadField({ certificate, onPick, error }: CertificateUploadFieldProps) {
  const { t } = useTranslation();
  const typography = useTypography();
  const { width } = useWindowDimensions();
  const sideBySide = width >= 560;

  return (
    <View style={styles.root}>
      <Text
        className="mb-2 text-sm text-heading"
        style={{ fontFamily: typography.fontFamilyMedium, fontWeight: typography.bodyWeight }}
      >
        {t('auth.certificateLabel')}
      </Text>

      <View style={[styles.row, sideBySide ? styles.rowHorizontal : styles.rowVertical]}>
        <Pressable
          onPress={onPick}
          style={[
            styles.uploadBox,
            sideBySide ? styles.uploadBoxHorizontal : undefined,
            error ? styles.uploadBoxError : undefined,
          ]}
        >
          <View style={styles.uploadIconWrap}>
            <AppIcon name="plus" size={20} color={UI.primary} strokeWidth={2} />
          </View>
          <Text
            style={[styles.uploadText, { fontFamily: typography.fontFamilyMedium }]}
            numberOfLines={3}
          >
            {certificate ? certificate.name : t('auth.certificateHint')}
          </Text>
        </Pressable>

        <View style={[styles.noticeBox, glassSurfaceStyle(), sideBySide ? styles.noticeBoxHorizontal : undefined]}>
          <View style={styles.noticeHeader}>
            <AppIcon name="check" size={16} color={UI.primary} strokeWidth={2.25} />
            <Text
              style={[styles.noticeTitle, { fontFamily: typography.fontFamily, fontWeight: typography.headingWeight }]}
            >
              {t('auth.certificateNoticeTitle')}
            </Text>
          </View>
          <Text
            style={[styles.noticeText, { fontFamily: typography.fontFamilyRegular, fontWeight: typography.bodyWeight }]}
          >
            {t('auth.certificateVerificationNotice')}
          </Text>
        </View>
      </View>

      {error ? <Text className="mt-1.5 text-sm text-error">{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginBottom: 16,
  },
  row: {
    gap: 12,
  },
  rowHorizontal: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  rowVertical: {
    flexDirection: 'column',
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 102, 255, 0.35)',
    backgroundColor: UI.primaryLight,
    borderRadius: UI.radius.card,
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : {}),
  },
  uploadBoxHorizontal: {
    flex: 1,
    minWidth: 0,
  },
  uploadBoxError: {
    borderColor: UI.danger,
  },
  uploadIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 13,
    lineHeight: 18,
    color: UI.primary,
    textAlign: 'center',
  },
  noticeBox: {
    padding: 14,
    gap: 8,
  },
  noticeBoxHorizontal: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noticeTitle: {
    fontSize: 13,
    lineHeight: 18,
    color: UI.text.primary,
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 18,
    color: UI.text.secondary,
  },
});
