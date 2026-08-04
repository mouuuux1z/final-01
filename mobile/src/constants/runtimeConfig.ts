import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { API_URL, APP_TZ_OFFSET_MINUTES, PRODUCTION_HOST, SOCKET_URL } from './config';

export type AppRuntimeEnvironment = 'local-backend' | 'production-backend';

export interface RuntimeDiagnostics {
  platform: string;
  appVersion: string;
  buildNumber: string | number | null;
  runtimeEnvironment: AppRuntimeEnvironment;
  apiUrl: string;
  socketUrl: string;
  apiOrigin: string;
  tzOffsetMinutes: number;
  isDevBuild: boolean;
  expoReleaseChannel: string | null;
  configSource: string;
}

function resolveConfigSource(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return 'EXPO_PUBLIC_API_URL';
  }
  if (process.env.EXPO_PUBLIC_USE_LOCAL_BACKEND === 'true') {
    return 'EXPO_PUBLIC_USE_LOCAL_BACKEND';
  }
  const extra = Constants.expoConfig?.extra ?? {};
  if (extra.apiUrl) {
    return 'app.json extra.apiUrl';
  }
  return 'PRODUCTION_API_URL fallback';
}

export function getRuntimeEnvironment(): AppRuntimeEnvironment {
  const api = API_URL.toLowerCase();
  if (api.includes('localhost') || api.includes('127.0.0.1') || api.includes('10.0.2.2')) {
    return 'local-backend';
  }
  return 'production-backend';
}

export function getRuntimeDiagnostics(): RuntimeDiagnostics {
  const expoConfig = Constants.expoConfig;
  return {
    platform: Platform.OS,
    appVersion: expoConfig?.version ?? 'unknown',
    buildNumber: expoConfig?.android?.versionCode ?? expoConfig?.ios?.buildNumber ?? null,
    runtimeEnvironment: getRuntimeEnvironment(),
    apiUrl: API_URL,
    socketUrl: SOCKET_URL,
    apiOrigin: API_URL.replace(/\/api\/?$/, ''),
    tzOffsetMinutes: APP_TZ_OFFSET_MINUTES,
    isDevBuild: typeof __DEV__ !== 'undefined' ? __DEV__ : false,
    expoReleaseChannel:
      (Constants.expoConfig?.extra as { releaseChannel?: string } | undefined)?.releaseChannel ??
      Constants.expoConfig?.runtimeVersion ??
      null,
    configSource: resolveConfigSource(),
  };
}

export function logRuntimeDiagnostics(): void {
  const diagnostics = getRuntimeDiagnostics();
  const banner = [
    '========== MYDoc Runtime ==========',
    `platform: ${diagnostics.platform}`,
    `appVersion: ${diagnostics.appVersion} (${diagnostics.buildNumber ?? 'n/a'})`,
    `environment: ${diagnostics.runtimeEnvironment}`,
    `devBuild: ${diagnostics.isDevBuild}`,
    `configSource: ${diagnostics.configSource}`,
    `API_URL: ${diagnostics.apiUrl}`,
    `SOCKET_URL: ${diagnostics.socketUrl}`,
    `TZ offset: ${diagnostics.tzOffsetMinutes} min`,
    `production host: ${PRODUCTION_HOST}`,
    '===================================',
  ].join('\n');

  console.log(banner);

  if (diagnostics.runtimeEnvironment === 'local-backend') {
    console.warn(
      '[MYDoc] Local backend mode — data/features come from localhost, not from production APK.',
    );
  }
}
