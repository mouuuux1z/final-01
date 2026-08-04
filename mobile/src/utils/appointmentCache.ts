import type { QueryClient, QueryKey } from '@tanstack/react-query';
import { isDoctorQueueAppointment } from './appointmentHelpers';
import type { Appointment, PaginatedResponse } from '../types';

export function isAppointmentList(value: unknown): value is Appointment[] {
  return (
    Array.isArray(value) &&
    value.every((item) => item && typeof item === 'object' && 'id' in item && 'attendanceStatus' in item)
  );
}

export function isDoctorAppointmentsQueueKey(queryKey: QueryKey): boolean {
  if (!queryKey.includes('appointments')) return false;
  if (queryKey.includes('doctor-dashboard')) return false;
  if (queryKey.includes('messages')) return false;
  if (queryKey.includes('schedule')) return false;

  const lastKey = queryKey[queryKey.length - 1];
  return lastKey === 'appointments' || lastKey === 'doctor';
}

export function mergeAppointmentIntoList(list: Appointment[], appointment: Appointment): Appointment[] {
  const index = list.findIndex((item) => item.id === appointment.id);
  if (index === -1) return list;
  return list.map((item) => (item.id === appointment.id ? appointment : item));
}

export function removeAppointmentFromList(list: Appointment[], appointmentId: string): Appointment[] {
  return list.filter((item) => item.id !== appointmentId);
}

export function patchAppointmentListCaches(queryClient: QueryClient, appointment: Appointment): void {
  queryClient.setQueriesData(
    { queryKey: ['appointments'] },
    (old: unknown) => {
      if (!old) return old;

      if (
        typeof old === 'object' &&
        old !== null &&
        'items' in old &&
        Array.isArray((old as PaginatedResponse<Appointment>).items)
      ) {
        const paginated = old as PaginatedResponse<Appointment>;
        const exists = paginated.items.some((item) => item.id === appointment.id);
        if (!exists) return old;

        return {
          ...paginated,
          items: paginated.items.map((item) => (item.id === appointment.id ? appointment : item)),
        };
      }

      if (Array.isArray(old)) {
        const exists = old.some((item) => item.id === appointment.id);
        if (!exists) return old;
        return mergeAppointmentIntoList(old, appointment);
      }

      return old;
    },
  );
}

export function removeAppointmentFromDoctorQueueCaches(
  queryClient: QueryClient,
  appointmentId: string,
): void {
  queryClient.setQueriesData<Appointment[]>(
    {
      predicate: (query) =>
        isAppointmentList(query.state.data) && isDoctorAppointmentsQueueKey(query.queryKey),
    },
    (old) => (old ? removeAppointmentFromList(old, appointmentId) : old),
  );
}

export function syncAttendanceAcrossCaches(
  queryClient: QueryClient,
  appointment: Appointment,
  options?: { refetchLists?: boolean },
): void {
  patchAppointmentListCaches(queryClient, appointment);

  if (!isDoctorQueueAppointment(appointment)) {
    removeAppointmentFromDoctorQueueCaches(queryClient, appointment.id);
  }

  if (options?.refetchLists) {
    void queryClient.invalidateQueries({
      queryKey: ['appointments'],
      refetchType: 'active',
    });
  }
}
