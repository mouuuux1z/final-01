import type { PaginationParams } from '../../utils/pagination.js';
export declare class PatientsRepository {
    findById(id: string): Promise<{
        status: import("@prisma/client").$Enums.EntityStatus;
        name: string;
        id: string;
        createdAt: Date;
        email: string;
        phone: string;
        _count: {
            appointments: number;
        };
        attendancePoints: number;
        bookingBlockedUntil: Date;
    }>;
    update(id: string, data: {
        name?: string;
        phone?: string;
    }): Promise<{
        status: import("@prisma/client").$Enums.EntityStatus;
        name: string;
        id: string;
        email: string;
        phone: string;
        attendancePoints: number;
        bookingBlockedUntil: Date;
    }>;
    findMany(pagination: PaginationParams): Promise<{
        items: {
            status: import("@prisma/client").$Enums.EntityStatus;
            name: string;
            id: string;
            createdAt: Date;
            email: string;
            phone: string;
            attendancePoints: number;
        }[];
        total: number;
    }>;
    updateStatus(id: string, status: string): Promise<{
        status: import("@prisma/client").$Enums.EntityStatus;
        name: string;
        id: string;
        email: string;
    }>;
}
export declare const patientsRepository: PatientsRepository;
