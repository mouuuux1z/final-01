import axios from 'axios';
import type { TFunction } from 'i18next';
import { getApiErrorMessage } from '../services/api';
import { getLocalizedNetworkUnreachableMessage } from './apiErrorMessages';

const API_ERROR_KEYS: Record<string, string> = {
  'Invalid credentials': 'auth.loginError',
  'Admin access required': 'auth.adminLoginError',
  'Internal server error': 'auth.serverError',
  'Too many authentication attempts, please try again later': 'auth.tooManyAttempts',
  'Your account is pending admin approval. You will be notified once approved.':
    'auth.doctorPendingMessage',
  'Your clinic account is pending admin approval': 'auth.clinicPendingMessage',
  'Account suspended': 'auth.loginError',
  'Account is inactive': 'auth.loginError',
  'Account disabled': 'auth.loginError',
  'Validation failed': 'auth.loginError',
};

function getLoginApiMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;
  const data = error.response?.data as { message?: string } | undefined;
  return data?.message?.trim() ?? null;
}

export function getLoginPendingRoute(error: unknown): 'ClinicPending' | 'DoctorPending' | null {
  if (!axios.isAxiosError(error) || error.response?.status !== 403) return null;

  const message = getLoginApiMessage(error);
  if (message === 'Your clinic account is pending admin approval') {
    return 'ClinicPending';
  }
  if (message === 'Your account is pending admin approval. You will be notified once approved.') {
    return 'DoctorPending';
  }

  return null;
}

export function getLoginErrorMessage(error: unknown, t: TFunction, fallbackKey = 'auth.loginError'): string {
  if (axios.isAxiosError(error) && !error.response) {
    return getLocalizedNetworkUnreachableMessage();
  }

  const raw = getApiErrorMessage(error, t(fallbackKey));
  const translationKey = API_ERROR_KEYS[raw];
  return translationKey ? t(translationKey) : raw;
}

export type RegisterFieldName =
  | 'name'
  | 'email'
  | 'phone'
  | 'password'
  | 'confirmPassword'
  | 'specialization'
  | 'city'
  | 'location'
  | 'certificate';

export type RegisterFieldErrors = Partial<Record<RegisterFieldName, string>>;

export function getApiFieldErrors(error: unknown): RegisterFieldErrors {
  if (!axios.isAxiosError(error)) return {};

  const data = error.response?.data as
    | { errors?: Record<string, string[] | undefined> }
    | undefined;

  if (!data?.errors) return {};

  const mapped: RegisterFieldErrors = {};
  for (const [key, messages] of Object.entries(data.errors)) {
    const message = messages?.find(Boolean);
    if (message) {
      mapped[key as RegisterFieldName] = message;
    }
  }
  return mapped;
}

const REGISTER_API_MESSAGE_KEYS: Record<string, { field?: RegisterFieldName; key: string }> = {
  'Email already registered': { field: 'email', key: 'auth.errors.emailTaken' },
  'Validation failed': { key: 'auth.errors.fixForm' },
  'File upload failed. Please upload a valid certificate file.': {
    field: 'certificate',
    key: 'auth.errors.certificateRequired',
  },
};

export function mapRegisterApiError(
  error: unknown,
  t: TFunction,
  fallbackKey = 'auth.registerError',
): { fieldErrors: RegisterFieldErrors; formError: string | null } {
  if (axios.isAxiosError(error) && !error.response) {
    return { fieldErrors: {}, formError: getLocalizedNetworkUnreachableMessage() };
  }

  const apiFieldErrors = getApiFieldErrors(error);
  const rawMessage = getApiErrorMessage(error, t(fallbackKey));
  const mapped = REGISTER_API_MESSAGE_KEYS[rawMessage];

  const fieldErrors: RegisterFieldErrors = { ...apiFieldErrors };

  if (mapped?.field) {
    fieldErrors[mapped.field] = t(mapped.key);
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, formError: t('auth.errors.fixForm') };
  }

  return { fieldErrors: {}, formError: rawMessage };
}
