import { UserType } from '@prisma/client';
import type { LoginInput, RegisterInput } from './auth.schema.js';
import { clinicRegisterMultipartSchema, doctorRegisterMultipartSchema } from './auth.schema.js';
import type { z } from 'zod';
type DoctorRegisterInput = z.infer<typeof doctorRegisterMultipartSchema> & {
    certificate: string;
};
type ClinicRegisterInput = z.infer<typeof clinicRegisterMultipartSchema> & {
    certificate: string;
};
export declare class AuthService {
    registerDoctor(input: DoctorRegisterInput): Promise<{
        user: {
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
        };
        pendingApproval: true;
    }>;
    registerClinic(input: ClinicRegisterInput): Promise<{
        user: {
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
        };
        pendingApproval: true;
    }>;
    register(input: RegisterInput): Promise<{
        user: {
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
        };
        pendingApproval: true;
    } | {
        pendingApproval: false;
        token: string;
        expiresAt: Date;
        user: {
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
        };
    }>;
    login(input: LoginInput, ipAddress?: string): Promise<{
        token: string;
        expiresAt: Date;
        user: {
            status: import("@prisma/client").$Enums.EntityStatus;
            name: string;
            id: string;
            email: string;
            phone: string;
            attendancePoints: number;
            bookingBlockedUntil: Date;
        } | {
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
        };
        userType: import("@prisma/client").$Enums.UserType;
    }>;
    logout(token: string): Promise<void>;
    getProfile(userId: string, userType: UserType): Promise<{
        status: import("@prisma/client").$Enums.EntityStatus;
        name: string;
        id: string;
        email: string;
        phone: string;
        attendancePoints: number;
        bookingBlockedUntil: Date;
    } | {
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
    }>;
    private assertUserCanLogin;
    private resolveLoginByCredentials;
    private findUserWithPassword;
    private createSession;
}
export declare const authService: AuthService;
export {};
