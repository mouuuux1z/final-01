import axios from 'axios';
import { api } from './api';
import { API_URL, getApiBaseOrigin } from '../constants/config';
import { getLocalizedApiFallback } from '../utils/apiErrorMessages';
import type { Appointment } from '../types';

export interface QueueSessionState {
  isActive: boolean;
  isCompleted: boolean;
  currentNumber: number;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface DoctorTodayQueue {
  date: string;
  session: QueueSessionState;
  appointments: Appointment[];
  totalActive: number;
  maxQueueNumber: number;
}

export interface AppointmentQueueStatus {
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  clinicName: string | null;
  date: string;
  time: string;
  queueNumber: number;
  currentNumber: number;
  patientsAhead: number;
  isActive: boolean;
  isCompleted: boolean;
  isCancelled: boolean;
  isYourTurn: boolean;
}

function unwrapApiData<T>(payload: { data?: T } | undefined, context: string): T {
  if (payload?.data === undefined || payload.data === null) {
    throw new Error(`Invalid ${context} response`);
  }
  return payload.data;
}

export async function getDoctorTodayQueue(): Promise<DoctorTodayQueue> {
  const { data } = await api.get<{ data?: DoctorTodayQueue }>('/doctor/me/queue/today');
  return unwrapApiData(data, 'queue');
}

export async function startDoctorReception(): Promise<DoctorTodayQueue> {
  const { data } = await api.post<{ data?: DoctorTodayQueue }>('/doctor/me/queue/start');
  return unwrapApiData(data, 'queue start');
}

export async function advanceDoctorQueue(): Promise<DoctorTodayQueue> {
  const { data } = await api.post<{ data?: DoctorTodayQueue }>('/doctor/me/queue/next');
  return unwrapApiData(data, 'queue next');
}

export async function getAppointmentQueueStatus(appointmentId: string): Promise<AppointmentQueueStatus> {
  const { data } = await api.get<{ data?: AppointmentQueueStatus }>(
    `/appointments/${appointmentId}/queue-status`,
  );
  return unwrapApiData(data, 'queue status');
}

export function isQueueUnavailableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const message = String((error as Error).message ?? '');
  return (
    message.includes('Invalid queue') ||
    message.includes('doctor_queue_sessions') ||
    message.includes('queueNumber') ||
    message.includes('Internal server error')
  );
}

export function getQueueErrorHint(): string {
  return getLocalizedApiFallback();
}

export async function isLiveQueueAvailableOnServer(): Promise<boolean> {
  try {
    const { data } = await axios.get<{ features?: { liveQueue?: boolean }; data?: { liveQueue?: boolean } }>(
      `${getApiBaseOrigin()}/health`,
      { timeout: 10_000 },
    );
    if (typeof data?.features?.liveQueue === 'boolean') {
      return data.features.liveQueue;
    }
    const { data: queueProbe } = await axios.get<{ data?: { liveQueue?: boolean } }>(
      `${API_URL}/health/queue`,
      { timeout: 10_000 },
    );
    return Boolean(queueProbe?.data?.liveQueue);
  } catch {
    return false;
  }
}

export function isQueueRouteNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  if (!axios.isAxiosError(error)) return false;
  if (error.response?.status !== 404) return false;
  const message = String((error.response.data as { message?: string } | undefined)?.message ?? '');
  return message.toLowerCase().includes('route not found');
}
