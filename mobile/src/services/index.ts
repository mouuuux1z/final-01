export {
  api,
  setUnauthorizedHandler,
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  getApiErrorMessage,
} from './api';
export { connectSocket, disconnectSocket, getSocket, SocketEvents } from './socket';
export {
  updatePatientProfile,
  updateDoctorProfile,
  updateClinicProfile,
} from './profileApi';
export type {
  UpdatePatientProfileInput,
  UpdateDoctorProfileInput,
  UpdateClinicProfileInput,
} from './profileApi';
