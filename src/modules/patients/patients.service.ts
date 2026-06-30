import { AppError } from '../../utils/AppError.js';
import { buildPaginationMeta, parsePagination } from '../../utils/pagination.js';
import { patientsRepository } from './patients.repository.js';

export class PatientsService {
  async getProfile(patientId: string) {
    const patient = await patientsRepository.findById(patientId);
    if (!patient) throw new AppError('Patient not found', 404);
    return patient;
  }

  async updateProfile(patientId: string, data: { name?: string; phone?: string }) {
    return patientsRepository.update(patientId, data);
  }

  async listAll(query: Record<string, unknown>) {
    const pagination = parsePagination(query);
    const { items, total } = await patientsRepository.findMany(pagination);
    return { items, meta: buildPaginationMeta(pagination.page, pagination.limit, total) };
  }

  async updateStatus(id: string, status: string) {
    const patient = await patientsRepository.findById(id);
    if (!patient) throw new AppError('Patient not found', 404);
    return patientsRepository.updateStatus(id, status);
  }
}

export const patientsService = new PatientsService();
