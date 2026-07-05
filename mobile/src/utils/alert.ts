import { Alert, Platform } from 'react-native';

export function showAlert(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }

  Alert.alert(title, message);
}

export function showAlertAsync(title: string, message?: string): Promise<void> {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [{ text: 'OK', onPress: () => resolve() }]);
  });
}

export function confirmAlert(
  title: string,
  message: string,
  confirmLabel: string,
  cancelLabel: string,
): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
