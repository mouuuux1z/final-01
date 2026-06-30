import { UserType } from '@prisma/client';
import type { GenerateAvailabilityInput, GenerateRecurringAvailabilityInput } from './doctors.schema.js';
export declare class DoctorsService {
    search(query: Record<string, unknown>): Promise<{
        items: {
            status: import("@prisma/client").$Enums.EntityStatus;
            name: string;
            id: string;
            clinic: {
                name: string;
                id: string;
                location: string;
            };
            rating: number;
            email: string;
            location: string;
            city: string;
            specialization: string;
            phone: string;
            serialNumber: string;
            description: string;
            image: string;
            ratingCount: number;
            isOnline: boolean;
            clinicId: string;
        }[];
        meta: import("../../utils/pagination.js").PaginationMeta;
    }>;
    adminSearch(query: Record<string, unknown>): Promise<{
        items: {
            status: import("@prisma/client").$Enums.EntityStatus;
            name: string;
            id: string;
            createdAt: Date;
            clinic: {
                name: string;
                id: string;
                location: string;
            };
            rating: number;
            email: string;
            location: string;
            city: string;
            specialization: string;
            phone: string;
            serialNumber: string;
            description: string;
            image: string;
            ratingCount: number;
            disableReason: string;
            isOnline: boolean;
            clinicId: string;
        }[];
        meta: import("../../utils/pagination.js").PaginationMeta;
    }>;
    getProfile(id: string): Promise<{
        name: string;
        id: string;
        clinic: {
            name: string;
            id: string;
            location: string;
        };
        rating: number;
        location: string;
        city: string;
        specialization: string;
        phone: string;
        serialNumber: string;
        clinicInfo: string;
        description: string;
        image: string;
        ratingCount: number;
        isOnline: boolean;
        schedules: {
            id: string;
            doctorId: string;
            dayOfWeek: import("@prisma/client").$Enums.DayOfWeek;
            startTime: string;
            endTime: string;
        }[];
    }>;
    getById(id: string): Promise<{
        clinic: {
            name: string;
            id: string;
            location: string;
            phone: string;
        };
        schedules: {
            id: string;
            doctorId: string;
            dayOfWeek: import("@prisma/client").$Enums.DayOfWeek;
            startTime: string;
            endTime: string;
        }[];
        chatSettings: {
            id: string;
            doctorId: string;
            repliesEnabled: boolean;
        };
        _count: {
            appointments: number;
            ratings: number;
        };
    } & {
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
    updateProfile(doctorId: string, data: Record<string, unknown>, image?: string, certificate?: string): Promise<{
        status: import("@prisma/client").$Enums.EntityStatus;
        name: string;
        id: string;
        email: string;
        location: string;
        city: string;
        specialization: string;
        certificate: string;
        phone: string;
        serialNumber: string;
        description: string;
        image: string;
        isOnline: boolean;
        lastActive: Date;
        clinicId: string;
    }>;
    adminUpdate(id: string, data: Record<string, unknown>): Promise<{
        status: import("@prisma/client").$Enums.EntityStatus;
        name: string;
        id: string;
        email: string;
        location: string;
        city: string;
        specialization: string;
        certificate: string;
        phone: string;
        serialNumber: string;
        description: string;
        image: string;
        isOnline: boolean;
        lastActive: Date;
        clinicId: string;
    }>;
    deleteDoctor(id: string): Promise<void>;
    setOnlineStatus(doctorId: string, isOnline: boolean): Promise<{
        id: string;
        isOnline: boolean;
        lastActive: Date;
    }>;
    getSchedules(doctorId: string): Promise<{
        id: string;
        doctorId: string;
        dayOfWeek: import("@prisma/client").$Enums.DayOfWeek;
        startTime: string;
        endTime: string;
    }[]>;
    createSchedule(doctorId: string, data: {
        dayOfWeek: string;
        startTime: string;
        endTime: string;
    }): Promise<{
        id: string;
        doctorId: string;
        dayOfWeek: import("@prisma/client").$Enums.DayOfWeek;
        startTime: string;
        endTime: string;
    }>;
    updateSchedule(scheduleId: string, doctorId: string, data: {
        startTime?: string;
        endTime?: string;
    }): Promise<{
        id: string;
        doctorId: string;
        dayOfWeek: import("@prisma/client").$Enums.DayOfWeek;
        startTime: string;
        endTime: string;
    }>;
    deleteSchedule(scheduleId: string, doctorId: string): Promise<void>;
    getAvailability(doctorId: string, filters: {
        date?: Date;
        from?: Date;
        to?: Date;
    }): Promise<{
        id: string;
        doctorId: string;
        date: Date;
        time: string;
        isBooked: boolean;
    }[]>;
    createAvailabilitySlot(doctorId: string, date: Date, time: string): Promise<{
        id: string;
        doctorId: string;
        date: Date;
        time: string;
        isBooked: boolean;
    }>;
    bulkCreateAvailability(doctorId: string, date: Date, times: string[]): Promise<import("@prisma/client").Prisma.BatchPayload>;
    generateAvailability(doctorId: string, input: GenerateAvailabilityInput): Promise<{
        createdCount: number;
        skippedCount: number;
        slots: {
            id: string;
            doctorId: string;
            date: Date;
            time: string;
            isBooked: boolean;
        }[];
    }>;
    generateRecurringAvailability(doctorId: string, input: GenerateRecurringAvailabilityInput): Promise<{
        createdCount: number;
        skippedCount: number;
        daysProcessed: number;
        weeksAhead: number;
    }>;
    getMyAvailability(doctorId: string, filters: {
        date?: Date;
        from?: Date;
        to?: Date;
        availableOnly?: boolean;
    }): Promise<{
        id: string;
        doctorId: string;
        date: Date;
        time: string;
        isBooked: boolean;
    }[]>;
    private purgeExpiredAvailabilitySlots;
    deleteAvailabilitySlot(slotId: string, doctorId: string): Promise<void>;
    bootstrapDefaultAvailability(doctorId: string): Promise<void>;
    assertDoctorAccess(userId: string, userType: UserType, doctorId: string): void;
}
export declare const doctorsService: DoctorsService;
