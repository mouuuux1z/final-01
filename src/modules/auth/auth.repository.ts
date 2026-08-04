import { EntityStatus, UserType, NotificationTargetType, ComplaintUserType } from '@prisma/client';
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

  async findAccountByEmail(email: string): Promise<{ userType: UserType; userId: string; name: string } | null> {
    const admin = await this.findAdminByEmail(email);
    if (admin) return { userType: UserType.ADMIN, userId: admin.id, name: admin.name };

    const clinic = await this.findClinicByEmail(email);
    if (clinic) return { userType: UserType.CLINIC, userId: clinic.id, name: clinic.name };

    const doctor = await this.findDoctorByEmail(email);
    if (doctor) return { userType: UserType.DOCTOR, userId: doctor.id, name: doctor.name };

    const patient = await this.findPatientByEmail(email);
    if (patient) return { userType: UserType.PATIENT, userId: patient.id, name: patient.name };

    return null;
  }

  async findAccountWithPasswordByEmail(
    email: string,
  ): Promise<{ userType: UserType; user: { id: string; password: string; status?: EntityStatus } } | null> {
    const admin = await this.findAdminByEmail(email);
    if (admin) return { userType: UserType.ADMIN, user: admin };

    const clinic = await this.findClinicByEmail(email);
    if (clinic) return { userType: UserType.CLINIC, user: clinic };

    const doctor = await this.findDoctorByEmail(email);
    if (doctor) return { userType: UserType.DOCTOR, user: doctor };

    const patient = await this.findPatientByEmail(email);
    if (patient) return { userType: UserType.PATIENT, user: patient };

    return null;
  }

  async invalidatePasswordResetTokens(email: string) {
    await prisma.passwordResetToken.updateMany({
      where: { email, usedAt: null },
      data: { usedAt: new Date() },
    });
  }

  async createPasswordResetToken(data: {
    email: string;
    codeHash: string;
    userType: UserType;
    userId: string;
    expiresAt: Date;
  }) {
    return prisma.passwordResetToken.create({ data });
  }

  async findActivePasswordResetTokens(email: string) {
    return prisma.passwordResetToken.findMany({
      where: {
        email,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markPasswordResetTokenUsed(id: string) {
    return prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async updateUserPassword(userType: UserType, userId: string, passwordHash: string) {
    switch (userType) {
      case UserType.ADMIN:
        return prisma.admin.update({ where: { id: userId }, data: { password: passwordHash } });
      case UserType.CLINIC:
        return prisma.clinic.update({ where: { id: userId }, data: { password: passwordHash } });
      case UserType.DOCTOR:
        return prisma.doctor.update({ where: { id: userId }, data: { password: passwordHash } });
      case UserType.PATIENT:
        return prisma.patient.update({ where: { id: userId }, data: { password: passwordHash } });
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

  async findUserPassword(userType: UserType, userId: string): Promise<string | null> {
    switch (userType) {
      case UserType.ADMIN: {
        const user = await prisma.admin.findUnique({ where: { id: userId }, select: { password: true } });
        return user?.password ?? null;
      }
      case UserType.CLINIC: {
        const user = await prisma.clinic.findUnique({ where: { id: userId }, select: { password: true } });
        return user?.password ?? null;
      }
      case UserType.DOCTOR: {
        const user = await prisma.doctor.findUnique({ where: { id: userId }, select: { password: true } });
        return user?.password ?? null;
      }
      case UserType.PATIENT: {
        const user = await prisma.patient.findUnique({ where: { id: userId }, select: { password: true } });
        return user?.password ?? null;
      }
      default:
        return null;
    }
  }

  async deleteUserAccount(userType: UserType, userId: string): Promise<void> {
    const email = await this.findUserEmail(userType, userId);
    if (!email) {
      throw new Error('User not found');
    }

    await prisma.$transaction(async (tx) => {
      await tx.session.deleteMany({ where: { userId, userType } });
      await tx.passwordResetToken.deleteMany({ where: { userId, userType } });
      await tx.loginAttempt.deleteMany({ where: { email } });

      const targetType = userType as NotificationTargetType;
      await tx.notification.deleteMany({ where: { targetId: userId, targetType } });

      switch (userType) {
        case UserType.PATIENT: {
          await tx.complaint.deleteMany({
            where: { userId, userType: ComplaintUserType.PATIENT },
          });
          await tx.appointment.deleteMany({ where: { patientId: userId } });
          await tx.patient.delete({ where: { id: userId } });
          break;
        }
        case UserType.DOCTOR: {
          await tx.complaint.deleteMany({
            where: { userId, userType: ComplaintUserType.DOCTOR },
          });
          await tx.doctor.delete({ where: { id: userId } });
          break;
        }
        case UserType.CLINIC: {
          await tx.complaint.deleteMany({
            where: { userId, userType: ComplaintUserType.CLINIC },
          });
          await tx.clinic.delete({ where: { id: userId } });
          break;
        }
        default:
          throw new Error('Unsupported user type for account deletion');
      }
    });
  }

  private async findUserEmail(userType: UserType, userId: string): Promise<string | null> {
    switch (userType) {
      case UserType.CLINIC: {
        const user = await prisma.clinic.findUnique({ where: { id: userId }, select: { email: true } });
        return user?.email ?? null;
      }
      case UserType.DOCTOR: {
        const user = await prisma.doctor.findUnique({ where: { id: userId }, select: { email: true } });
        return user?.email ?? null;
      }
      case UserType.PATIENT: {
        const user = await prisma.patient.findUnique({ where: { id: userId }, select: { email: true } });
        return user?.email ?? null;
      }
      default:
        return null;
    }
  }
}

export const authRepository = new AuthRepository();
