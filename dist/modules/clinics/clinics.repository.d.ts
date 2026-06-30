import { EntityStatus } from '@prisma/client';
import type { PaginationParams } from '../../utils/pagination.js';
export declare class ClinicsRepository {
    findById(id: string): Promise<{
        _count: {
            doctors: number;
        };
        doctors: {
            status: import("@prisma/client").$Enums.EntityStatus;
            name: string;
            id: string;
            createdAt: Date;
            rating: number;
            email: string;
            location: string;
            city: string;
            specialization: string;
            phone: string;
            serialNumber: string;
            description: string;
            ratingCount: number;
            disableReason: string;
            isOnline: boolean;
        }[];
    } & {
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
    update(id: string, data: {
        name?: string;
        location?: string;
        phone?: string;
        city?: string;
        specialization?: string;
        status?: string;
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
    findMany(pagination: PaginationParams, status?: EntityStatus): Promise<{
        items: {
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
            _count: {
                doctors: number;
            };
        }[];
        total: number;
    }>;
    findDoctorById(doctorId: string): Promise<{
        status: import("@prisma/client").$Enums.EntityStatus;
        id: string;
        email: string;
        clinicId: string;
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
        clinicInfo?: string;
        description?: string;
        certificate?: string;
        clinicId: string;
    }): Promise<{
        status: import("@prisma/client").$Enums.EntityStatus;
        name: string;
        id: string;
        createdAt: Date;
        rating: number;
        email: string;
        location: string;
        city: string;
        specialization: string;
        phone: string;
        serialNumber: string;
        description: string;
        ratingCount: number;
        disableReason: string;
        isOnline: boolean;
    }>;
    assignDoctor(clinicId: string, doctorId: string): Promise<{
        status: import("@prisma/client").$Enums.EntityStatus;
        name: string;
        id: string;
        createdAt: Date;
        rating: number;
        email: string;
        location: string;
        city: string;
        specialization: string;
        phone: string;
        serialNumber: string;
        description: string;
        ratingCount: number;
        disableReason: string;
        isOnline: boolean;
    }>;
    updateDoctorStatus(clinicId: string, doctorId: string, status: 'ACTIVE' | 'DISABLED', disableReason?: string | null): Promise<import("@prisma/client").Prisma.BatchPayload>;
    getDoctorInClinic(clinicId: string, doctorId: string): Promise<{
        status: import("@prisma/client").$Enums.EntityStatus;
        name: string;
        id: string;
        createdAt: Date;
        rating: number;
        email: string;
        location: string;
        city: string;
        specialization: string;
        phone: string;
        serialNumber: string;
        description: string;
        ratingCount: number;
        disableReason: string;
        isOnline: boolean;
    }>;
    removeDoctor(clinicId: string, doctorId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    getNextDoctorSerialNumber(): Promise<string>;
    emailExists(email: string): Promise<boolean>;
}
export declare const clinicsRepository: ClinicsRepository;
