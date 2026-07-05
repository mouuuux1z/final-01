import { api } from './api';
import type { Appointment, DayOfWeek, DoctorAvailabilitySlot, DoctorSchedule } from '../types';

export type DoctorWorkspaceMode = 'doctor' | 'clinic';

export interface DoctorWorkspaceApi {
  listAppointments: (params?: Record<string, unknown>) => Promise<Appointment[]>;
  listAvailability: (params?: Record<string, unknown>) => Promise<DoctorAvailabilitySlot[]>;
  listSchedules: () => Promise<DoctorSchedule[]>;
  createAvailabilitySlot: (date: string, time: string) => Promise<unknown>;
  deleteAvailabilitySlot: (slotId: string) => Promise<unknown>;
  generateAvailability: (payload: {
    date: string;
    startTime: string;
    endTime: string;
    slotDurationMinutes?: number;
    gapMinutes?: number;
    breakStart?: string;
    breakEnd?: string;
  }) => Promise<{ createdCount?: number; skippedCount?: number }>;
  generateRecurringAvailability: (payload: {
    daysOfWeek: DayOfWeek[];
    startTime: string;
    endTime: string;
    slotDurationMinutes?: number;
    gapMinutes?: number;
    breakStart?: string;
    breakEnd?: string;
    weeksAhead?: number;
  }) => Promise<unknown>;
  manualBook: (payload: {
    patientName: string;
    patientPhone?: string;
    date: string;
    time: string;
    notes?: string;
  }) => Promise<unknown>;
  acceptAppointment: (appointmentId: string) => Promise<unknown>;
  rejectAppointment: (appointmentId: string) => Promise<unknown>;
  markAttendance: (appointmentId: string, attendanceStatus: string) => Promise<unknown>;
}

function clinicDoctorBase(doctorId?: string): string {
  if (!doctorId) throw new Error('doctorId is required for clinic workspace');
  return `/clinics/me/doctors/${doctorId}`;
}

export function createDoctorWorkspaceApi(
  mode: DoctorWorkspaceMode,
  doctorId?: string,
): DoctorWorkspaceApi {
  if (mode === 'clinic') {
    const base = clinicDoctorBase(doctorId);
    return {
      listAppointments: async (params) => {
        const { data } = await api.get(`${base}/appointments`, { params });
        return data.data.items ?? data.data;
      },
      listAvailability: async (params) => {
        const { data } = await api.get(`${base}/availability`, { params });
        return data.data;
      },
      listSchedules: async () => {
        const { data } = await api.get(`${base}/schedules`);
        return data.data;
      },
      createAvailabilitySlot: async (date, time) => {
        const { data } = await api.post(`${base}/availability`, { date, time });
        return data.data;
      },
      deleteAvailabilitySlot: async (slotId) => {
        const { data } = await api.delete(`${base}/availability/${slotId}`);
        return data.data;
      },
      generateAvailability: async (payload) => {
        const { data } = await api.post(`${base}/availability/generate`, payload);
        return data.data;
      },
      generateRecurringAvailability: async (payload) => {
        const { data } = await api.post(`${base}/availability/generate-recurring`, payload);
        return data.data;
      },
      manualBook: async (payload) => {
        const { data } = await api.post(`${base}/appointments/manual`, payload);
        return data.data;
      },
      acceptAppointment: async (appointmentId) => {
        const { data } = await api.post(`${base}/appointments/${appointmentId}/accept`);
        return data.data;
      },
      rejectAppointment: async (appointmentId) => {
        const { data } = await api.post(`${base}/appointments/${appointmentId}/reject`);
        return data.data;
      },
      markAttendance: async (appointmentId, attendanceStatus) => {
        const { data } = await api.patch(`${base}/appointments/${appointmentId}/attendance`, {
          attendanceStatus,
        });
        return data.data;
      },
    };
  }

  return {
    listAppointments: async (params) => {
      const { data } = await api.get('/appointments', { params });
      return data.data.items ?? data.data;
    },
    listAvailability: async (params) => {
      const { data } = await api.get('/doctor/me/availability', { params });
      return data.data;
    },
    listSchedules: async () => {
      const { data } = await api.get('/doctor/me/schedules');
      return data.data;
    },
    createAvailabilitySlot: async (date, time) => {
      const { data } = await api.post('/doctor/me/availability', { date, time });
      return data.data;
    },
    deleteAvailabilitySlot: async (slotId) => {
      const { data } = await api.delete(`/doctor/me/availability/${slotId}`);
      return data.data;
    },
    generateAvailability: async (payload) => {
      const { data } = await api.post('/doctor/me/availability/generate', payload);
      return data.data;
    },
    generateRecurringAvailability: async (payload) => {
      const { data } = await api.post('/doctor/me/availability/generate-recurring', payload);
      return data.data;
    },
    manualBook: async (payload) => {
      const { data } = await api.post('/doctor/me/appointments/manual', payload);
      return data.data;
    },
    acceptAppointment: async (appointmentId) => {
      const { data } = await api.post(`/doctor/me/appointments/${appointmentId}/accept`);
      return data.data;
    },
    rejectAppointment: async (appointmentId) => {
      const { data } = await api.post(`/doctor/me/appointments/${appointmentId}/reject`);
      return data.data;
    },
    markAttendance: async (appointmentId, attendanceStatus) => {
      const { data } = await api.patch(`/doctor/me/appointments/${appointmentId}/attendance`, {
        attendanceStatus,
      });
      return data.data;
    },
  };
}
