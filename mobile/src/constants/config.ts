import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const PRODUCTION_HOST = '0012-production.up.railway.app';
export const PRODUCTION_API_URL = `https://${PRODUCTION_HOST}/api`;
export const PRODUCTION_SOCKET_URL = `https://${PRODUCTION_HOST}`;

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (extra.apiUrl as string | undefined) ??
  PRODUCTION_API_URL;

export const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL ??
  (extra.socketUrl as string | undefined) ??
  PRODUCTION_SOCKET_URL;
