import Constants from 'expo-constants';
import { Platform } from 'react-native';

const extra = Constants.expoConfig?.extra ?? {};

function resolveDevHost(fallbackHost = 'localhost'): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname) return hostname;
  }
  return fallbackHost;
}

function buildApiUrl(host: string): string {
  return `http://${host}:3000/api`;
}

function buildSocketUrl(host: string): string {
  return `http://${host}:3000`;
}

const configuredApiUrl =
  process.env.EXPO_PUBLIC_API_URL ?? (extra.apiUrl as string | undefined);
const configuredSocketUrl =
  process.env.EXPO_PUBLIC_SOCKET_URL ?? (extra.socketUrl as string | undefined);

const devHost = resolveDevHost();

export const API_URL = configuredApiUrl ?? buildApiUrl(devHost);
export const SOCKET_URL = configuredSocketUrl ?? buildSocketUrl(devHost);
