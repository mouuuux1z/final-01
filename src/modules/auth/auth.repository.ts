import { EntityStatus, UserType } from '@prisma/client';
import { prisma } from '../../config/database.js';
import type { RegisterInput } from './auth.schema.js';

export class AuthRepository {
  async findAdminByEmail(email: string) {
    return prisma.admin.findUnique({ where: { email } });
  }

  async findClinicByEmail(email: string) {
    return prisma.clinic.findUnique({ where: { email } });
  }

  async findDoctorByEmail(email: string) {
    return prisma.doctor.findUnique({ where: { email } });
  }

  async findPatientByEmail(email: string) {
    return prisma.patient.findUnique({ where: { email } });
  }

  async createPatient(data: { name: string; email: string; password: string; phone: string }) {
    return prisma.patient.create({
      data: { ...data, status: EntityStatus.ACTIVE },
      select: { id: true, name: true, email: true, phone: true, status: true, attendancePoints: true, bookingBlockedUntil: true, createdAt: true },
    });
  }

  async createDoctor(data: {
    serialNumber: string;
    name: string;
    email: string;
    password: string;
    phone: string;
    specialization: string;
    city: string;
    location?: string;
    certificate?: string;
    clinicInfo?: string;
    description?: string;
    clinicId?: string;
  }) {
    return prisma.doctor.create({
      data: { ...data, status: EntityStatus.PENDING },
      select: {
        id: true,
        serialNumber: true,
        name: true,
        email: true,
        phone: true,
        specialization: true,
        city: true,
        location: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async createClinic(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    location: string;
    city: string;
    specialization: string;
    certificate?: string;
  }) {
    return prisma.clinic.create({
      data: { ...data, status: EntityStatus.PENDING },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        city: true,
        specialization: true,
        certificate: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async createAdmin(data: { name: string; email: string; password: string }) {
    return prisma.admin.create({
      data,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  }

  async getNextDoctorSerialNumber(): Promise<string> {
    const count = await prisma.doctor.count();
    const year = new Date().getFullYear();
    return `DOC-${year}-${String(count + 1).padStart(3, '0')}`;
  }

  async createSession(data: { token: string; userType: UserType; userId: string; expiresAt: Date }) {
    return prisma.session.create({ data });
  }

  async updateSessionToken(id: string, token: string) {
    return prisma.session.update({ where: { id }, data: { token } });
  }

  async deleteSession(token: string) {
    return prisma.session.deleteMany({ where: { token } });
  }

  async deleteSessionById(id: string) {
    return prisma.session.delete({ where: { id } });
  }

  async createLoginAttempt(data: {
    email: string;
    ipAddress?: string;
    success: boolean;
    userType?: UserType;
  }) {
    return prisma.loginAttempt.create({ data });
  }

  async findUserByType(userType: UserType, userId: string) {
    switch (userType) {
      case UserType.ADMIN:
        return prisma.admin.findUnique({
          where: { id: userId },
          select: { id: true, name: true, email: true, role: true },
        });
      case UserType.CLINIC:
        return prisma.clinic.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            location: true,
            city: true,
            specialization: true,
            certificate: true,
            status: true,
          },
        });
      case UserType.DOCTOR:
        return prisma.doctor.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            specialization: true,
            city: true,
            location: true,
            status: true,
            isOnline: true,
            serialNumber: true,
            clinic: { select: { id: true, name: true, location: true } },
          },
        });
      case UserType.PATIENT:
        return prisma.patient.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
            attendancePoints: true,
            bookingBlockedUntil: true,
          },
        });
      default:
        return null;
    }
  }

  async emailExists(userType: UserType, email: string): Promise<boolean> {
    switch (userType) {
      case UserType.ADMIN:
        return (await this.findAdminByEmail(email)) !== null;
      case UserType.CLINIC:
        return (await this.findClinicByEmail(email)) !== null;
      case UserType.DOCTOR:
        return (await this.findDoctorByEmail(email)) !== null;
      case UserType.PATIENT:
        return (await this.findPatientByEmail(email)) !== null;
      default:
        return false;
    }
  }

  async registerUser(input: RegisterInput & { certificate?: string }, passwordHash: string) {
    switch (input.userType) {
      case UserType.PATIENT:
        return this.createPatient({
          name: input.name,
          email: input.email,
          password: passwordHash,
          phone: input.phone,
        });
      case UserType.DOCTOR: {
        const serialNumber = await this.getNextDoctorSerialNumber();
        return this.createDoctor({
          serialNumber,
          name: input.name,
          email: input.email,
          password: passwordHash,
          phone: input.phone,
          specialization: input.specialization,
          city: input.city,
          location: input.location,
          certificate: input.certificate,
          clinicInfo: input.clinicInfo,
          description: input.description,
          clinicId: input.clinicId,
        });
      }
      case UserType.CLINIC: {
        return this.createClinic({
          name: input.name,
          email: input.email,
          password: passwordHash,
          phone: input.phone,
          location: input.location,
          city: input.city,
          specialization: input.specialization,
          certificate: input.certificate,
        });
      }
    }
  }
}

export const authRepository = new AuthRepository();
