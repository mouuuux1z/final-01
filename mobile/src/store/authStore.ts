import { create } from 'zustand';

import { persist, createJSONStorage } from 'zustand/middleware';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {

  api,

  clearStoredToken,

  getApiErrorMessage,

  setStoredToken,

  withSkipUnauthorized,

} from '../services/api';

import { queryClient } from '../services/queryClient';

import { useChatStore } from './chatStore';

import { useNotificationStore } from './notificationStore';

import type { ApiResponse, AuthResponse, RegisterResult, User, UserType } from '../types';
import { appendFileToFormData } from '../utils/filePicker';



interface LoginParams {
  email: string;
  password: string;
  userType?: UserType;
}



interface RegisterParams {
  userType: UserType;
  name: string;
  email: string;
  password: string;
  phone?: string;
  specialization?: string;
  city?: string;
  location?: string;
  clinicInfo?: string;
  description?: string;
}

interface RegisterClinicParams {
  name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  location: string;
  specialization: string;
  certificate: import('../utils/filePicker').PickedFile;
}

interface RegisterDoctorParams {
  name: string;
  email: string;
  password: string;
  phone: string;
  specialization: string;
  city: string;
  location: string;
  certificate: import('../utils/filePicker').PickedFile;
}



interface AuthState {

  user: User | null;

  token: string | null;

  userType: UserType | null;

  isAuthenticated: boolean;

  isHydrated: boolean;

  isLoading: boolean;

  error: string | null;

  login: (params: LoginParams) => Promise<void>;

  register: (params: RegisterParams) => Promise<RegisterResult>;

  registerDoctor: (params: RegisterDoctorParams) => Promise<RegisterResult>;

  registerClinic: (params: RegisterClinicParams) => Promise<RegisterResult>;

  logout: () => Promise<void>;

  fetchProfile: () => Promise<void>;

  mergePatientProfile: (profile: Partial<import('../types').PatientUser>) => void;

  mergeUserProfile: (profile: Partial<User>) => void;

  restoreSession: () => Promise<void>;

  setHydrated: (value: boolean) => void;

  clearError: () => void;

}



function clearLocalSession(set: (partial: Partial<AuthState>) => void): void {

  useChatStore.getState().reset();

  useNotificationStore.getState().reset();

  queryClient.clear();

  set({

    user: null,

    token: null,

    userType: null,

    isAuthenticated: false,

    isLoading: false,

    error: null,

  });

}

let sessionRestoreGeneration = 0;

function bumpSessionRestoreGeneration(): number {
  sessionRestoreGeneration += 1;
  return sessionRestoreGeneration;
}



export const useAuthStore = create<AuthState>()(

  persist(

    (set, get) => ({

      user: null,

      token: null,

      userType: null,

      isAuthenticated: false,

      isHydrated: false,

      isLoading: false,

      error: null,



      setHydrated: (value) => set({ isHydrated: value }),



      clearError: () => set({ error: null }),



      login: async (params) => {
        const loginGeneration = bumpSessionRestoreGeneration();
        set({ isLoading: true, error: null });
        try {
          await clearStoredToken();
          const loginPayload: Record<string, string> = {
            email: params.email.trim().toLowerCase(),
            password: params.password,
          };
          if (params.userType) {
            loginPayload.userType = params.userType;
          }
          const { data } = await withSkipUnauthorized(() =>
            api.post<ApiResponse<AuthResponse & { userType?: UserType }>>('/auth/login', loginPayload),
          );
          if (loginGeneration !== sessionRestoreGeneration) {
            set({ isLoading: false });
            return;
          }
          if (!data.success || !data.data?.token) {
            throw new Error(data.message || 'Login failed');
          }
          const resolvedUserType = data.data.userType ?? params.userType;
          if (!resolvedUserType) {
            throw new Error(data.message || 'Login failed');
          }
          await setStoredToken(data.data.token);
          set({
            user: data.data.user,
            token: data.data.token,
            userType: resolvedUserType,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          if (loginGeneration === sessionRestoreGeneration) {
            set({ isLoading: false, error: getApiErrorMessage(error, 'Login failed') });
          }
          throw error;
        }
      },



      registerDoctor: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const formData = new FormData();
          formData.append('name', params.name);
          formData.append('email', params.email);
          formData.append('password', params.password);
          formData.append('phone', params.phone);
          formData.append('specialization', params.specialization);
          formData.append('city', params.city);
          formData.append('location', params.location.trim());
          appendFileToFormData(formData, 'certificate', params.certificate);

          await withSkipUnauthorized(() =>
            api.post<ApiResponse<AuthResponse>>('/auth/register/doctor', formData),
          );

          set({ isLoading: false });
          return { pendingApproval: true };
        } catch (error) {
          set({ isLoading: false, error: getApiErrorMessage(error, 'Registration failed') });
          throw error;
        }
      },

      registerClinic: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const formData = new FormData();
          formData.append('name', params.name);
          formData.append('email', params.email);
          formData.append('password', params.password);
          formData.append('phone', params.phone);
          formData.append('city', params.city);
          formData.append('location', params.location);
          formData.append('specialization', params.specialization);
          appendFileToFormData(formData, 'certificate', params.certificate);

          await withSkipUnauthorized(() =>
            api.post<ApiResponse<AuthResponse>>('/auth/register/clinic', formData),
          );

          set({ isLoading: false });
          return { pendingApproval: true };
        } catch (error) {
          set({ isLoading: false, error: getApiErrorMessage(error, 'Registration failed') });
          throw error;
        }
      },

      register: async (params) => {

        set({ isLoading: true, error: null });

        try {

          const { data } = await withSkipUnauthorized(() =>

            api.post<ApiResponse<AuthResponse>>('/auth/register', params),

          );



          if (data.data.pendingApproval) {

            set({ isLoading: false });

            return { pendingApproval: true };

          }



          if (!data.data.token) {

            throw new Error('Registration failed');

          }



          await setStoredToken(data.data.token);

          set({

            user: data.data.user,

            token: data.data.token,

            userType: params.userType,

            isAuthenticated: true,

            isLoading: false,

          });

          return { pendingApproval: false };

        } catch (error) {

          set({ isLoading: false, error: getApiErrorMessage(error, 'Registration failed') });

          throw error;

        }

      },



      logout: async () => {

        const token = get().token;

        try {

          if (token) {

            await withSkipUnauthorized(() => api.post('/auth/logout'));

          }

        } catch {

          // Ignore logout API errors — still clear local session

        } finally {

          await clearStoredToken();

          clearLocalSession(set);

          await useAuthStore.persist.clearStorage();

        }

      },



      fetchProfile: async () => {
        const { token, userType } = get();
        if (!token || !userType) return;

        try {
          const { data } = await api.get<ApiResponse<User>>('/auth/me');
          if (data?.data) {
            set({ user: data.data });
          }
        } catch {
          // Keep existing session user if profile refresh fails.
        }
      },

      mergePatientProfile: (profile) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...profile } : state.user,
        }));
      },

      mergeUserProfile: (profile) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...profile } : state.user,
        }));
      },



      restoreSession: async () => {
        const restoreGeneration = bumpSessionRestoreGeneration();
        const { token, userType } = get();
        if (!token || !userType) {
          set({ isAuthenticated: false });
          return;
        }

        const sessionToken = token;

        try {
          await setStoredToken(sessionToken);
          const { data } = await withSkipUnauthorized(() =>
            api.get<ApiResponse<User>>('/auth/me'),
          );

          if (restoreGeneration !== sessionRestoreGeneration) {
            return;
          }

          if (get().token !== sessionToken) {
            return;
          }

          set({
            user: data.data,
            isAuthenticated: true,
          });
        } catch {
          if (restoreGeneration !== sessionRestoreGeneration) {
            return;
          }

          if (get().token !== sessionToken) {
            return;
          }

          await clearStoredToken();
          clearLocalSession(set);
          await useAuthStore.persist.clearStorage();
        }
      },

    }),

    {

      name: 'mydoc-auth',

      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({

        user: state.user,

        token: state.token,

        userType: state.userType,

      }),

      onRehydrateStorage: () => (state, error) => {

        if (error) {

          void useAuthStore.persist.clearStorage();

        }

        if (state) {
          state.isAuthenticated = Boolean(state.token && state.userType);
          state.setHydrated(true);
        } else {
          useAuthStore.getState().setHydrated(true);
        }

      },

    },

  ),

);

