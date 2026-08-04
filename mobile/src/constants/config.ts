import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const PRODUCTION_HOST = '197.140.142.178';
export const PRODUCTION_API_URL = `http://${PRODUCTION_HOST}/api`;
export const PRODUCTION_SOCKET_URL = `http://${PRODUCTION_HOST}`;

/** Used only when EXPO_PUBLIC_USE_LOCAL_BACKEND=true (npm start / serve-web-static). */
export const LOCAL_API_URL = 'http://localhost:3000/api';
export const LOCAL_SOCKET_URL = 'http://localhost:3000';

/**
 * Single rule for all platforms (web + Android + iOS):
 * 1. EXPO_PUBLIC_API_URL if set (EAS/APK/AAB + explicit overrides)
 * 2. Local backend only when EXPO_PUBLIC_USE_LOCAL_BACKEND=true
 * 3. app.json extra.apiUrl
 * 4. Production fallback
 *
 * Previously, web on localhost auto-switched to local backend silently — that caused
 * localhost and APK to hit different servers and databases.
 */
function resolveApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL?.trim()) {
    return process.env.EXPO_PUBLIC_API_URL.trim();
  }
  if (process.env.EXPO_PUBLIC_USE_LOCAL_BACKEND === 'true') {
    return LOCAL_API_URL;
  }
  const fromExtra = extra.apiUrl as string | undefined;
  if (fromExtra?.trim()) {
    return fromExtra.trim();
  }
  return PRODUCTION_API_URL;
}

function resolveSocketUrl(): string {
  if (process.env.EXPO_PUBLIC_SOCKET_URL?.trim()) {
    return process.env.EXPO_PUBLIC_SOCKET_URL.trim();
  }
  if (process.env.EXPO_PUBLIC_USE_LOCAL_BACKEND === 'true') {
    return LOCAL_SOCKET_URL;
  }
  const fromExtra = extra.socketUrl as string | undefined;
  if (fromExtra?.trim()) {
    return fromExtra.trim();
  }
  return PRODUCTION_SOCKET_URL;
}

export const API_URL = resolveApiUrl();
export const SOCKET_URL = resolveSocketUrl();

export function getApiBaseOrigin(): string {
  return API_URL.replace(/\/api\/?$/, '');
}

/** Wall-clock offset for appointment times (minutes east of UTC). Must match backend APP_TZ_OFFSET_MINUTES. */
export const APP_TZ_OFFSET_MINUTES = Number(
  process.env.EXPO_PUBLIC_APP_TZ_OFFSET_MINUTES ??
    (extra.appTzOffsetMinutes as number | string | undefined) ??
    60,
);
