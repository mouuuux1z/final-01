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

const SHEET_MAX_HEIGHT = Dimensions.get('window').height * 0.9;

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

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onRequestClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close modal"
          onPress={close}
          style={styles.backdrop}
        />
        <View style={styles.sheet} className={sheetClassName}>
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
  },
  sheet: {
    width: '100%',
    maxHeight: SHEET_MAX_HEIGHT,
    flexShrink: 1,
    backgroundColor: UI.surface,
    borderTopLeftRadius: UI.radius.card,
    borderTopRightRadius: UI.radius.card,
    overflow: 'hidden',
    flexDirection: 'column',
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
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    ...(Platform.OS === 'web' ? { overflow: 'hidden' } : {}),
  },
  scroll: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    ...(Platform.OS === 'web'
      ? {
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }
      : {}),
  },
  scrollContent: {
    paddingBottom: 32,
  },
});
