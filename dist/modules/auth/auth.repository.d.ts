import { UserType } from '@prisma/client';
import type { RegisterInput } from './auth.schema.js';
export declare class AuthRepository {
    findAdminByEmail(email: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.AdminRole;
    }>;
    findClinicByEmail(email: string): Promise<{
        status: import("@prisma/client").$Enums.EntityStatus;
        name: string;
        id: string;
        createdAt: Date;
        email: string;
        password: string;
        location: string;
        city: string;
        specialization: string;
        certificate: string | null;
        phone: string;
    }>;
    findDoctorByEmail(email: string): Promise<{
        status: import("@prisma/client").$Enums.EntityStatus;
        name: string;
        id: string;
        createdAt: Date;
        rating: number;
        email: string;
        password: string;
        location: string | null;
        city: string;
        specialization: string;
        certificate: string | null;
        phone: string;
        serialNumber: string;
        clinicInfo: string | null;
        description: string | null;
        image: string | null;
        ratingCount: number;
        disableReason: string | null;
        isOnline: boolean;
        lastActive: Date | null;
        clinicId: string | null;
    }>;
    findPatientByEmail(email: string): Promise<{
        status: import("@prisma/client").$Enums.EntityStatus;
        name: string;
        id: string;
        createdAt: Date;
        email: string;
        password: string;
        phone: string;
        attendancePoints: number;
        bookingBlockedUntil: Date | null;
    }>;
    createPatient(data: {
        name: string;
        email: string;
        password: string;
        phone: string;
    }): Promise<{
        status: import("@prisma/client").$Enums.EntityStatus;
        name: string;
        id: string;
        createdAt: Date;
        email: string;
        phone: string;
        attendancePoints: number;
        bookingBlockedUntil: Date;
    }>;
    createDoctor(data: {
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
    }): Promise<{
        status: import("@prisma/client").$Enums.EntityStatus;
        name: string;
        id: string;
        createdAt: Date;
        email: string;
        location: string;
        city: string;
        specialization: string;
        phone: string;
        serialNumber: string;
    }>;
    createClinic(data: {
        name: string;
        email: string;
        password: string;
        phone: string;
        location: string;
        city: string;
        specialization: string;
        certificate?: string;
    }): Promise<{
        status: import("@prisma/client").$Enums.EntityStatus;
        name: string;
        id: string;
        createdAt: Date;
        email: string;
        location: string;
        city: string;
        specialization: string;
        certificate: string;
        phone: string;
    }>;
    createAdmin(data: {
        name: string;
        email: string;
        password: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        email: string;
        role: import("@prisma/client").$Enums.AdminRole;
    }>;
    getNextDoctorSerialNumber(): Promise<string>;
    createSession(data: {
        token: string;
        userType: UserType;
        userId: string;
        expiresAt: Date;
    }): Promise<{
        id: string;
        token: string;
        userType: import("@prisma/client").$Enums.UserType;
        userId: string;
        expiresAt: Date;
        createdAt: Date;
    }>;
    updateSessionToken(id: string, token: string): Promise<{
        id: string;
        token: string;
        userType: import("@prisma/client").$Enums.UserType;
        userId: string;
        expiresAt: Date;
        createdAt: Date;
    }>;
    deleteSession(token: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    deleteSessionById(id: string): Promise<{
        id: string;
        token: string;
        userType: import("@prisma/client").$Enums.UserType;
        userId: string;
        expiresAt: Date;
        createdAt: Date;
    }>;
    createLoginAttempt(data: {
        email: string;
        ipAddress?: string;
        success: boolean;
        userType?: UserType;
    }): Promise<{
        id: string;
        userType: import("@prisma/client").$Enums.UserType | null;
        createdAt: Date;
        email: string;
        ipAddress: string | null;
        success: boolean;
    }>;
    findUserByType(userType: UserType, userId: string): Promise<{
        name: string;
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.AdminRole;
    } | {
        status: import("@prisma/client").$Enums.EntityStatus;
        name: string;
        id: string;
        email: string;
        location: string;
        city: string;
        specialization: string;
        certificate: string;
        phone: string;
    } | {
        status: import("@prisma/client").$Enums.EntityStatus;
        name: string;
        id: string;
        clinic: {
            name: string;
            id: string;
            location: string;
        };
        email: string;
        location: string;
        city: string;
        specialization: string;
        phone: string;
        serialNumber: string;
        isOnline: boolean;
    } | {
        status: import("@prisma/client").$Enums.EntityStatus;
        name: string;
        id: string;
        email: string;
        phone: string;
        attendancePoints: number;
        bookingBlockedUntil: Date;
    }>;
    emailExists(userType: UserType, email: string): Promise<boolean>;
    registerUser(input: RegisterInput & {
        certificate?: string;
    }, passwordHash: string): Promise<{
        status: import("@prisma/client").$Enums.EntityStatus;
        name: string;
        id: string;
        createdAt: Date;
        email: string;
        phone: string;
        attendancePoints: number;
        bookingBlockedUntil: Date;
    } | {
        status: import("@prisma/client").$Enums.EntityStatus;
        name: string;
        id: string;
        createdAt: Date;
        email: string;
        location: string;
        city: string;
        specialization: string;
        phone: string;
        serialNumber: string;
    } | {
        status: import("@prisma/client").$Enums.EntityStatus;
        name: string;
        id: string;
        createdAt: Date;
        email: string;
        location: string;
        city: string;
        specialization: string;
        certificate: string;
        phone: string;
    }>;
}
export declare const authRepository: AuthRepository;
