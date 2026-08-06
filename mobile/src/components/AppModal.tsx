import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ModalProps,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import type { ReactNode } from 'react';
import { UI } from '../theme/ui';

const WINDOW_HEIGHT = Dimensions.get('window').height;
const SHEET_MAX_HEIGHT = WINDOW_HEIGHT * 0.9;
const SHEET_HEIGHT = Platform.select({
  android: Math.round(WINDOW_HEIGHT * 0.85),
  ios: Math.round(WINDOW_HEIGHT * 0.85),
  default: undefined,
}) as number | undefined;

interface AppModalProps extends Pick<ModalProps, 'visible' | 'onRequestClose' | 'animationType'> {
  children: ReactNode;
  onBackdropPress?: () => void;
  sheetClassName?: ViewProps['className'];
}

export function AppModal({
  visible,
  onRequestClose,
  animationType = 'slide',
  children,
  onBackdropPress,
  sheetClassName,
}: AppModalProps) {
  const close = onBackdropPress ?? onRequestClose;

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onRequestClose}
      statusBarTranslucent
      hardwareAccelerated={Platform.OS === 'android'}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close modal"
          onPress={close}
          style={styles.backdrop}
        />
        <View style={styles.sheet} className={sheetClassName} collapsable={false}>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    ...(Platform.OS === 'web'
      ? ({
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
        } as unknown as ViewStyle)
      : {}),
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    zIndex: 0,
  },
  sheet: {
    width: '100%',
    maxHeight: SHEET_MAX_HEIGHT,
    ...(SHEET_HEIGHT != null
      ? {
          height: SHEET_HEIGHT,
          minHeight: SHEET_HEIGHT,
        }
      : {
          minHeight: 200,
        }),
    backgroundColor: UI.surface,
    borderTopLeftRadius: UI.radius.card,
    borderTopRightRadius: UI.radius.card,
    overflow: 'hidden',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 1,
    ...(Platform.OS === 'android'
      ? {
          elevation: 16,
        }
      : {}),
    ...(Platform.OS === 'web'
      ? ({
          maxHeight: '90vh',
          display: 'flex',
        } as unknown as ViewStyle)
      : {}),
  },
});

export const appModalStyles = StyleSheet.create({
  body: {
    flex: 1,
    minHeight: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
    flexGrow: 1,
  },
});
