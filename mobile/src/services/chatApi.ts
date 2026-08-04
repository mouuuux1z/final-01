import { api } from './api';
import { appendFileToFormData, type PickedFile } from '../utils/filePicker';

export async function sendPatientChatMessage(params: {
  doctorId: string;
  patientId: string;
  message: string;
  file?: PickedFile | null;
}): Promise<void> {
  const formData = new FormData();
  formData.append('doctorId', params.doctorId);
  formData.append('patientId', params.patientId);
  formData.append('message', params.message.trim());

  if (params.file) {
    appendFileToFormData(formData, 'file', params.file);
  }

  await api.post('/chat/messages', formData);
}

export async function sendDoctorChatMessage(params: {
  path: string;
  doctorId?: string;
  patientId: string;
  message: string;
  file?: PickedFile | null;
}): Promise<void> {
  const formData = new FormData();
  formData.append('patientId', params.patientId);
  if (params.doctorId) {
    formData.append('doctorId', params.doctorId);
  }
  formData.append('message', params.message.trim());

  if (params.file) {
    appendFileToFormData(formData, 'file', params.file);
  }

  await api.post(params.path, formData);
}
