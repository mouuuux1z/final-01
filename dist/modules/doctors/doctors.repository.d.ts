import { EntityStatus, Prisma } from '@prisma/client';
import type { PaginationParams } from '../../utils/pagination.js';
export declare class DoctorsRepository {
    findMany(filters: {
        q?: string;
        city?: string;
        specialization?: string;
        status?: EntityStatus;
    }, pagination: PaginationParams): Promise<{
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
        total: number;
    }>;
    findManyAdmin(filters: {
        q?: string;
        city?: string;
        specialization?: string;
        status?: EntityStatus;
    }, pagination: PaginationParams): Promise<{
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
        total: number;
    }>;
    findById(id: string): Promise<{
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
    findByIdPublic(id: string): Promise<{
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
    update(id: string, data: Prisma.DoctorUpdateInput): Promise<{
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
    delete(id: string): Promise<{
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
    updateOnlineStatus(id: string, isOnline: boolean): Promise<{
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
    upsertScheduleByDay(doctorId: string, dayOfWeek: string, data: {
        startTime: string;
        endTime: string;
    }): Promise<{
        id: string;
        doctorId: string;
        dayOfWeek: import("@prisma/client").$Enums.DayOfWeek;
        startTime: string;
        endTime: string;
    }>;
    deleteSchedule(scheduleId: string, doctorId: string): Promise<{
        id: string;
        doctorId: string;
        dayOfWeek: import("@prisma/client").$Enums.DayOfWeek;
        startTime: string;
        endTime: string;
    }>;
    getAvailabilitySlots(doctorId: string, filters: {
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
    createManyAvailabilitySlots(doctorId: string, date: Date, times: string[]): Promise<Prisma.BatchPayload>;
    getAvailabilitySlotsForDate(doctorId: string, date: Date): Promise<{
        id: string;
        doctorId: string;
        date: Date;
        time: string;
        isBooked: boolean;
    }[]>;
    deleteAvailabilitySlot(slotId: string, doctorId: string): Promise<{
        id: string;
        doctorId: string;
        date: Date;
        time: string;
        isBooked: boolean;
    }>;
    getUnbookedSlotsUpToDate(doctorId: string, upToDate: Date): Promise<{
        id: string;
        date: Date;
        time: string;
    }[]>;
    deleteAvailabilitySlotsByIds(ids: string[], doctorId: string): Promise<Prisma.BatchPayload>;
    findDoctorsByClinic(clinicId: string): Promise<{
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
    }[]>;
}
export declare const doctorsRepository: DoctorsRepository;
