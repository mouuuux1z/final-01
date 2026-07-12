import { EntityStatus, UserType } from '@prisma/client';
import { AppError } from '../../utils/AppError.js';
import { logActivity } from '../../utils/activityLog.js';
import { buildPaginationMeta, parsePagination } from '../../utils/pagination.js';
import { hashPassword } from '../../utils/password.js';
import { adminRepository } from './admin.repository.js';
import { authRepository } from '../auth/auth.repository.js';

export class AdminService {
  async getAnalytics(query: Record<string, unknown>) {
    return adminRepository.getAnalytics(query.from as Date | undefined, query.to as Date | undefined);
  }

  async listComplaints(query: Record<string, unknown>) {
    const pagination = parsePagination(query);
    const { items, total } = await adminRepository.listComplaints(
      pagination,
      query.status as never,
    );
    return { items, meta: buildPaginationMeta(pagination.page, pagination.limit, total) };
  }

  async updateComplaint(id: string, status: string, adminName: string) {
    const complaint = await adminRepository.updateComplaint(id, status as never);
    await logActivity('UPDATE_COMPLAINT', adminName, `Complaint ${id} -> ${status}`);
    return complaint;
  }

  async getSiteContent() {
    return adminRepository.getSiteContent();
  }

  async upsertSiteContent(key: string, value: string, adminName: string) {
    const content = await adminRepository.upsertSiteContent(key, value);
    await logActivity('UPDATE_SITE_CONTENT', adminName, `Key: ${key}`);
    return content;
  }

  async verifyDoctor(id: string, status: EntityStatus, adminName: string, disableReason?: string | null) {
    const doctor = await adminRepository.verifyDoctor(id, status, disableReason);
    await logActivity('VERIFY_DOCTOR', adminName, `Doctor ${id} -> ${status}`);
    return doctor;
  }

  async createAdmin(data: { name: string; email: string; password: string; role?: string }, adminName: string) {
    const existingAdmins = await adminRepository.listAdmins();
    if (existingAdmins.length > 0) {
      throw new AppError('Admin account creation is disabled', 403);
    }
    const exists = await authRepository.emailExists(UserType.ADMIN, data.email);
    if (exists) throw new AppError('Email already registered', 409);

    const passwordHash = await hashPassword(data.password);
    const admin = await adminRepository.createAdmin({ ...data, password: passwordHash });
    await logActivity('CREATE_ADMIN', adminName, `Admin ${admin.email}`);
    return admin;
  }

  async listAdmins() {
    return adminRepository.listAdmins();
  }

  async listPendingDoctors(query: Record<string, unknown>) {
    const pagination = parsePagination(query);
    const { items, total } = await adminRepository.listPendingDoctors(pagination);
    return { items, meta: buildPaginationMeta(pagination.page, pagination.limit, total) };
  }
}

export const adminService = new AdminService();
