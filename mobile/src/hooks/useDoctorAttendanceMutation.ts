import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getApiErrorMessage } from '../services/api';
import { showAlert } from '../utils/alert';
import {
  isAppointmentList,
  mergeAppointmentIntoList,
  removeAppointmentFromDoctorQueueCaches,
  syncAttendanceAcrossCaches,
} from '../utils/appointmentCache';
import { isDoctorQueueAppointment } from '../utils/appointmentHelpers';
import type { ApiResponse, Appointment, AttendanceStatus } from '../types';

function applyAttendanceUpdate(appointment: Appointment, attendanceStatus: AttendanceStatus): Appointment {
  const status =
    attendanceStatus === 'ATTENDED'
      ? 'COMPLETED'
      : attendanceStatus === 'ABSENT'
        ? 'NO_SHOW'
        : appointment.status;

  return {
    ...appointment,
    attendanceStatus,
    status: status as Appointment['status'],
  };
}

export function useDoctorAttendanceMutation() {
  const queryClient = useQueryClient();
  const [markingId, setMarkingId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      id,
      attendanceStatus,
    }: {
      id: string;
      attendanceStatus: AttendanceStatus;
    }) => {
      const { data } = await api.patch<ApiResponse<Appointment>>(`/appointments/${id}/attendance`, {
        attendanceStatus,
      });
      if (!data.data) {
        throw new Error('Attendance update returned no appointment');
      }
      return data.data;
    },
    onMutate: async ({ id, attendanceStatus }) => {
      setMarkingId(id);
      await queryClient.cancelQueries({
        predicate: (query) => isAppointmentList(query.state.data),
      });

      const snapshots = queryClient.getQueriesData<Appointment[]>({
        predicate: (query) => isAppointmentList(query.state.data),
      });

      let shouldRemoveFromQueue = false;

      queryClient.setQueriesData<Appointment[]>(
        {
          predicate: (query) => isAppointmentList(query.state.data),
        },
        (old) => {
          if (!old) return old;
          const current = old.find((appointment) => appointment.id === id);
          if (!current) return old;
          const optimistic = applyAttendanceUpdate(current, attendanceStatus);
          if (!isDoctorQueueAppointment(optimistic)) {
            shouldRemoveFromQueue = true;
          }
          return mergeAppointmentIntoList(old, optimistic);
        },
      );

      if (shouldRemoveFromQueue) {
        removeAppointmentFromDoctorQueueCaches(queryClient, id);
      }

      return { snapshots };
    },
    onSuccess: (updatedAppointment) => {
      syncAttendanceAcrossCaches(queryClient, updatedAppointment);
    },
    onError: (error, _variables, context) => {
      context?.snapshots.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      const message = getApiErrorMessage(error);
      showAlert(message);
    },
    onSettled: () => setMarkingId(null),
  });

  return { mutation, markingId };
}
