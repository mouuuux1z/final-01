export declare class PatientsService {
    getProfile(patientId: string): Promise<{
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
    updateProfile(patientId: string, data: {
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
    listAll(query: Record<string, unknown>): Promise<{
        items: {
            status: import("@prisma/client").$Enums.EntityStatus;
            name: string;
            id: string;
            createdAt: Date;
            email: string;
            phone: string;
            attendancePoints: number;
        }[];
        meta: import("../../utils/pagination.js").PaginationMeta;
    }>;
    updateStatus(id: string, status: string): Promise<{
        status: import("@prisma/client").$Enums.EntityStatus;
        name: string;
        id: string;
        email: string;
    }>;
}
export declare const patientsService: PatientsService;
