import { EntityStatus } from '@prisma/client';
export declare class AdminService {
    getAnalytics(query: Record<string, unknown>): Promise<{
        totals: {
            patients: number;
            doctors: number;
            clinics: number;
            appointments: number;
            pendingDoctors: number;
            pendingClinics: number;
        };
        appointmentsByStatus: {
            status: import("@prisma/client").$Enums.AppointmentStatus;
            count: number;
        }[];
        recentActivity: {
            id: string;
            createdAt: Date;
            action: string;
            adminName: string;
            details: string | null;
        }[];
    }>;
    listComplaints(query: Record<string, unknown>): Promise<{
        items: {
            status: import("@prisma/client").$Enums.ComplaintStatus;
            id: string;
            userType: import("@prisma/client").$Enums.ComplaintUserType;
            userId: string;
            createdAt: Date;
            subject: string;
            body: string;
        }[];
        meta: import("../../utils/pagination.js").PaginationMeta;
    }>;
    updateComplaint(id: string, status: string, adminName: string): Promise<{
        status: import("@prisma/client").$Enums.ComplaintStatus;
        id: string;
        userType: import("@prisma/client").$Enums.ComplaintUserType;
        userId: string;
        createdAt: Date;
        subject: string;
        body: string;
    }>;
    getSiteContent(): Promise<{
        value: string;
        id: string;
        key: string;
        updatedAt: Date;
    }[]>;
    upsertSiteContent(key: string, value: string, adminName: string): Promise<{
        value: string;
        id: string;
        key: string;
        updatedAt: Date;
    }>;
    verifyDoctor(id: string, status: EntityStatus, adminName: string, disableReason?: string | null): Promise<{
        status: import("@prisma/client").$Enums.EntityStatus;
        name: string;
        id: string;
        email: string;
        disableReason: string;
    }>;
    createAdmin(data: {
        name: string;
        email: string;
        password: string;
        role?: string;
    }, adminName: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        email: string;
        role: import("@prisma/client").$Enums.AdminRole;
    }>;
    listAdmins(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        email: string;
        role: import("@prisma/client").$Enums.AdminRole;
    }[]>;
    listPendingDoctors(query: Record<string, unknown>): Promise<{
        items: {
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
        }[];
        meta: import("../../utils/pagination.js").PaginationMeta;
    }>;
}
export declare const adminService: AdminService;
