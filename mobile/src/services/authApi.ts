import { api } from './api';
import type { ApiResponse } from '../types';

export async function requestPasswordReset(email: string, language?: string) {
  const { data } = await api.post<ApiResponse<{ message: string }>>(
    '/auth/forgot-password',
    {
      email,
      ...(language ? { language } : {}),
    },
    { timeout: 45_000 },
  );
  return data;
}

export async function resetPassword(params: { email: string; code: string; password: string }) {
  const { data } = await api.post<ApiResponse<{ message: string }>>('/auth/reset-password', params);
  return data;
}

export async function deleteAccount(password: string) {
  const { data } = await api.delete<ApiResponse<{ message: string }>>('/auth/me', {
    data: { password },
  });
  return data;
}
