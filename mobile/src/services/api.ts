import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../constants/config';
import { getSecureItem, deleteSecureItem, setSecureItem } from '../utils/secureStorage';
import {
  getLocalizedApiFallback,
  getLocalizedNetworkTimeoutMessage,
  getLocalizedNetworkUnreachableMessage,
  translateApiMessage,
} from '../utils/apiErrorMessages';

const TOKEN_KEY = 'auth_token';

let memoryToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;
let skipUnauthorizedRedirect = false;
let authGraceUntil = 0;

const AUTH_PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/register/doctor',
  '/auth/register/clinic',
  '/auth/logout',
  '/auth/me',
];

export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

export function startAuthGracePeriod(ms = 3000): void {
  authGraceUntil = Date.now() + ms;
}

export async function withSkipUnauthorized<T>(fn: () => Promise<T>): Promise<T> {
  skipUnauthorizedRedirect = true;
  try {
    return await fn();
  } finally {
    skipUnauthorizedRedirect = false;
  }
}

function shouldSkipUnauthorizedRedirect(requestUrl: string): boolean {
  if (skipUnauthorizedRedirect) return true;
  if (Date.now() < authGraceUntil) return true;
  return AUTH_PUBLIC_PATHS.some((path) => requestUrl.includes(path));
}

export async function getStoredToken(): Promise<string | null> {
  if (memoryToken) return memoryToken;
  const stored = await getSecureItem(TOKEN_KEY);
  if (stored) memoryToken = stored;
  return stored;
}

export async function setStoredToken(token: string): Promise<void> {
  memoryToken = token;
  startAuthGracePeriod();
  await setSecureItem(TOKEN_KEY, token);
}

export async function clearStoredToken(): Promise<void> {
  memoryToken = null;
  authGraceUntil = 0;
  await deleteSecureItem(TOKEN_KEY);
}

export async function hydrateTokenCache(): Promise<void> {
  memoryToken = await getSecureItem(TOKEN_KEY);
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const isFormData =
    typeof FormData !== 'undefined' &&
    config.data instanceof FormData;

  if (isFormData) {
    config.headers.setContentType(false);
  } else if (!config.headers.getContentType()) {
    config.headers.setContentType('application/json');
  }

  const token = memoryToken ?? (await getStoredToken());
  if (token) {
    memoryToken = token;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const requestUrl = error.config?.url ?? '';
    if (
      error.response?.status === 401 &&
      unauthorizedHandler &&
      !shouldSkipUnauthorizedRedirect(requestUrl)
    ) {
      unauthorizedHandler();
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback?: string): string {
  const fallbackMessage = fallback ?? getLocalizedApiFallback();

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return getLocalizedNetworkTimeoutMessage();
      }
      return getLocalizedNetworkUnreachableMessage();
    }
    const data = error.response?.data as
      | { message?: string; errors?: Record<string, string[] | undefined> }
      | undefined;
    if (data?.errors) {
      const fieldMessages = Object.values(data.errors)
        .flat()
        .filter(Boolean) as string[];
      if (fieldMessages.length > 0) {
        return fieldMessages.map(translateApiMessage).join('\n');
      }
    }
    const message = data?.message ?? error.message ?? fallbackMessage;
    return translateApiMessage(message);
  }
  if (error instanceof Error) {
    return translateApiMessage(error.message);
  }
  return fallbackMessage;
}
