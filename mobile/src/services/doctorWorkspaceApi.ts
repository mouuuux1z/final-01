import { api } from './api';
import type { Appointment, DayOfWeek, DoctorAvailabilitySlot, DoctorSchedule } from '../types';

export type DoctorWorkspaceMode = 'doctor' | 'clinic';

type PaginatedAppointments = {
  items?: Appointment[];
  meta?: { totalPages?: number };
};

async function fetchAllAppointments(
  path: string,
  params: Record<string, unknown> = {},
): Promise<Appointment[]> {
  const limit = 500;
  let page = 1;
  let totalPages = 1;
  const items: Appointment[] = [];

  while (page <= totalPages) {
    const { data } = await api.get<{ data?: PaginatedAppointments }>(path, {
      params: { ...params, page, limit },
    });
    const batch = Array.isArray(data.data?.items)
      ? data.data.items
      : Array.isArray(data.data)
        ? data.data
        : [];
    items.push(...batch);
    totalPages = Math.max(1, data.data?.meta?.totalPages ?? 1);
    if (batch.length === 0) break;
    page += 1;
  }

  return items;
}

export interface DoctorWorkspaceApi {
  listAppointments: (params?: Record<string, unknown>) => Promise<Appointment[]>;
  listAllAppointments: (params?: Record<string, unknown>) => Promise<Appointment[]>;
  listAvailability: (params?: Record<string, unknown>) => Promise<DoctorAvailabilitySlot[]>;
  listSchedules: () => Promise<DoctorSchedule[]>;
  createSchedule: (payload: { dayOfWeek: DayOfWeek; startTime: string; endTime: string }) => Promise<DoctorSchedule>;
  updateSchedule: (
    scheduleId: string,
    payload: { startTime?: string; endTime?: string },
  ) => Promise<DoctorSchedule>;
  deleteSchedule: (scheduleId: string) => Promise<unknown>;
  syncWeeklySchedules: (payload: {
    days: Array<{ dayOfWeek: DayOfWeek; startTime: string; endTime: string }>;
  }) => Promise<DoctorSchedule[]>;
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
  generateFromWeeklySchedule: (payload: {
    slotDurationMinutes?: number;
    gapMinutes?: number;
    breakStart?: string;
    breakEnd?: string;
    daysAhead?: number;
  }) => Promise<{ createdCount?: number; skippedCount?: number; daysProcessed?: number; daysAhead?: number }>;
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
  listPatients: () => Promise<Array<{ id: string; name: string; phone: string }>>;
  createPrivateAppointment: (payload: {
    patientName?: string;
    patientPhone?: string;
    patientId?: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }) => Promise<Appointment>;
  updatePrivateAppointment: (
    id: string,
    payload: {
      patientName?: string;
      patientPhone?: string;
      patientId?: string;
      date: string;
      startTime: string;
      endTime: string;
      notes?: string;
    },
  ) => Promise<Appointment>;
  deletePrivateAppointment: (id: string) => Promise<unknown>;
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
        return Array.isArray(data.data?.items) ? data.data.items : Array.isArray(data.data) ? data.data : [];
      },
      listAllAppointments: async (params) => fetchAllAppointments(`${base}/appointments`, params ?? {}),
      listAvailability: async (params) => {
        const { data } = await api.get(`${base}/availability`, { params });
        return Array.isArray(data.data) ? data.data : Array.isArray(data.data?.items) ? data.data.items : [];
      },
      listSchedules: async () => {
        const { data } = await api.get(`${base}/schedules`);
        return Array.isArray(data.data) ? data.data : [];
      },
      createSchedule: async (payload) => {
        const { data } = await api.post(`${base}/schedules`, payload);
        return data.data;
      },
      updateSchedule: async (scheduleId, payload) => {
        const { data } = await api.patch(`${base}/schedules/${scheduleId}`, payload);
        return data.data;
      },
      deleteSchedule: async (scheduleId) => {
        const { data } = await api.delete(`${base}/schedules/${scheduleId}`);
        return data.data;
      },
      syncWeeklySchedules: async (payload) => {
        const { data } = await api.put(`${base}/schedules/weekly`, payload);
        return Array.isArray(data.data) ? data.data : [];
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
      generateFromWeeklySchedule: async (payload) => {
        const { data } = await api.post(`${base}/availability/generate-from-schedule`, payload);
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
      listPatients: async () => {
        const { data } = await api.get(`${base}/patients`);
        return Array.isArray(data.data) ? data.data : [];
      },
      createPrivateAppointment: async (payload) => {
        const { data } = await api.post('/appointments/private', payload);
        return data.data;
      },
      updatePrivateAppointment: async (id, payload) => {
        const { data } = await api.patch(`/appointments/private/${id}`, payload);
        return data.data;
      },
      deletePrivateAppointment: async (id) => {
        const { data } = await api.delete(`/appointments/private/${id}`);
        return data.data;
      },
    };
  }

  return {
    listAppointments: async (params) => {
      const { data } = await api.get('/appointments', { params });
      return Array.isArray(data.data?.items) ? data.data.items : Array.isArray(data.data) ? data.data : [];
    },
    listAllAppointments: async (params) => fetchAllAppointments('/appointments', params ?? {}),
    listAvailability: async (params) => {
      const { data } = await api.get('/doctor/me/availability', { params });
      return Array.isArray(data.data) ? data.data : Array.isArray(data.data?.items) ? data.data.items : [];
    },
    listSchedules: async () => {
      const { data } = await api.get('/doctor/me/schedules');
      return Array.isArray(data.data) ? data.data : [];
    },
    createSchedule: async (payload) => {
      const { data } = await api.post('/doctor/me/schedules', payload);
      return data.data;
    },
    updateSchedule: async (scheduleId, payload) => {
      const { data } = await api.patch(`/doctor/me/schedules/${scheduleId}`, payload);
      return data.data;
    },
    deleteSchedule: async (scheduleId) => {
      const { data } = await api.delete(`/doctor/me/schedules/${scheduleId}`);
      return data.data;
    },
    syncWeeklySchedules: async (payload) => {
      const { data } = await api.put('/doctor/me/schedules/weekly', payload);
      return Array.isArray(data.data) ? data.data : [];
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
    generateFromWeeklySchedule: async (payload) => {
      const { data } = await api.post('/doctor/me/availability/generate-from-schedule', payload);
      return data.data;
    },
    manualBook: async (payload) => {
      const { data } = await api.post('/appointments/manual', payload);
      return data.data;
    },
    acceptAppointment: async (appointmentId) => {
      const { data } = await api.post(`/appointments/${appointmentId}/accept`);
      return data.data;
    },
    rejectAppointment: async (appointmentId) => {
      const { data } = await api.post(`/appointments/${appointmentId}/reject`);
      return data.data;
    },
    markAttendance: async (appointmentId, attendanceStatus) => {
      const { data } = await api.patch(`/appointments/${appointmentId}/attendance`, {
        attendanceStatus,
      });
      return data.data;
    },
    listPatients: async () => {
      const { data } = await api.get('/doctor/me/patients');
      return Array.isArray(data.data) ? data.data : [];
    },
    createPrivateAppointment: async (payload) => {
      const { data } = await api.post('/appointments/private', payload);
      return data.data;
    },
    updatePrivateAppointment: async (id, payload) => {
      const { data } = await api.patch(`/appointments/private/${id}`, payload);
      return data.data;
    },
    deletePrivateAppointment: async (id) => {
      const { data } = await api.delete(`/appointments/private/${id}`);
      return data.data;
    },
  };
}
