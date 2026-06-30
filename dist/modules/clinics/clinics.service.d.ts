import { AttendanceStatus } from '@prisma/client';
import { appointmentsService } from '../appointments/appointments.service.js';
import { doctorsService } from '../doctors/doctors.service.js';
import type { z } from 'zod';
import type { createClinicDoctorSchema, clinicDoctorStatusSchema } from './clinics.schema.js';
type CreateClinicDoctorInput = z.infer<typeof createClinicDoctorSchema> & {
    certificate: string;
};
type ClinicDoctorStatusInput = z.infer<typeof clinicDoctorStatusSchema>;
export declare class ClinicsService {
    getProfile(clinicId: string): Promise<{
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
    updateProfile(clinicId: string, data: {
        name?: string;
        location?: string;
        phone?: string;
        city?: string;
        specialization?: string;
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
    createDoctor(clinicId: string, input: CreateClinicDoctorInput): Promise<{
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
    updateDoctorStatus(clinicId: string, doctorId: string, input: ClinicDoctorStatusInput): Promise<{
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
    private assertDoctorInClinic;
    getDoctorAppointments(clinicId: string, doctorId: string, query: Record<string, unknown>): Promise<{
        items: ({
            doctor: {
                name: string;
                id: string;
                specialization: string;
                image: string;
            };
            patient: {
                name: string;
                id: string;
                phone: string;
                attendancePoints: number;
            };
        } & {
            status: import("@prisma/client").$Enums.AppointmentStatus;
            id: string;
            createdAt: Date;
            doctorId: string;
            patientId: string | null;
            date: Date;
            time: string;
            notes: string | null;
            patientName: string | null;
            patientPhone: string | null;
            attendanceStatus: import("@prisma/client").$Enums.AttendanceStatus;
        })[];
        meta: import("../../utils/pagination.js").PaginationMeta;
    }>;
    getDoctorAvailability(clinicId: string, doctorId: string, query: Record<string, unknown>): Promise<{
        id: string;
        doctorId: string;
        date: Date;
        time: string;
        isBooked: boolean;
    }[]>;
    getDoctorSchedules(clinicId: string, doctorId: string): Promise<{
        id: string;
        doctorId: string;
        dayOfWeek: import("@prisma/client").$Enums.DayOfWeek;
        startTime: string;
        endTime: string;
    }[]>;
    generateDoctorRecurringAvailability(clinicId: string, doctorId: string, input: Parameters<typeof doctorsService.generateRecurringAvailability>[1]): Promise<{
        createdCount: number;
        skippedCount: number;
        daysProcessed: number;
        weeksAhead: number;
    }>;
    generateDoctorAvailability(clinicId: string, doctorId: string, input: Parameters<typeof doctorsService.generateAvailability>[1]): Promise<{
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
    createDoctorAvailabilitySlot(clinicId: string, doctorId: string, date: Date, time: string): Promise<{
        id: string;
        doctorId: string;
        date: Date;
        time: string;
        isBooked: boolean;
    }>;
    deleteDoctorAvailabilitySlot(clinicId: string, doctorId: string, slotId: string): Promise<void>;
    manualBookForDoctor(clinicId: string, doctorId: string, data: Parameters<typeof appointmentsService.doctorManualBook>[1]): Promise<{
        doctor: {
            name: string;
            id: string;
            specialization: string;
        };
    } & {
        status: import("@prisma/client").$Enums.AppointmentStatus;
        id: string;
        createdAt: Date;
        doctorId: string;
        patientId: string | null;
        date: Date;
        time: string;
        notes: string | null;
        patientName: string | null;
        patientPhone: string | null;
        attendanceStatus: import("@prisma/client").$Enums.AttendanceStatus;
    }>;
    acceptDoctorAppointment(clinicId: string, doctorId: string, appointmentId: string): Promise<{
        doctor: {
            name: string;
            id: string;
        };
        patient: {
            name: string;
            id: string;
        };
    } & {
        status: import("@prisma/client").$Enums.AppointmentStatus;
        id: string;
        createdAt: Date;
        doctorId: string;
        patientId: string | null;
        date: Date;
        time: string;
        notes: string | null;
        patientName: string | null;
        patientPhone: string | null;
        attendanceStatus: import("@prisma/client").$Enums.AttendanceStatus;
    }>;
    rejectDoctorAppointment(clinicId: string, doctorId: string, appointmentId: string): Promise<{
        doctor: {
            name: string;
            id: string;
        };
        patient: {
            name: string;
            id: string;
        };
    } & {
        status: import("@prisma/client").$Enums.AppointmentStatus;
        id: string;
        createdAt: Date;
        doctorId: string;
        patientId: string | null;
        date: Date;
        time: string;
        notes: string | null;
        patientName: string | null;
        patientPhone: string | null;
        attendanceStatus: import("@prisma/client").$Enums.AttendanceStatus;
    }>;
    markDoctorAppointmentAttendance(clinicId: string, doctorId: string, appointmentId: string, attendanceStatus: AttendanceStatus): Promise<{
        doctor: {
            name: string;
            id: string;
        };
        patient: {
            name: string;
            id: string;
            phone: string;
        };
    } & {
        status: import("@prisma/client").$Enums.AppointmentStatus;
        id: string;
        createdAt: Date;
        doctorId: string;
        patientId: string | null;
        date: Date;
        time: string;
        notes: string | null;
        patientName: string | null;
        patientPhone: string | null;
        attendanceStatus: import("@prisma/client").$Enums.AttendanceStatus;
    }>;
    getDoctorChatMessages(clinicId: string, doctorId: string, patientId: string, query: Record<string, unknown>): Promise<{
        items: {
            message: string;
            id: string;
            createdAt: Date;
            doctorId: string;
            patientId: string;
            senderType: import("@prisma/client").$Enums.SenderType;
            fileUrl: string | null;
            readAt: Date | null;
        }[];
        meta: import("../../utils/pagination.js").PaginationMeta;
    }>;
    sendDoctorChatMessage(clinicId: string, doctorId: string, patientId: string, message: string): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        doctorId: string;
        patientId: string;
        senderType: import("@prisma/client").$Enums.SenderType;
        fileUrl: string | null;
        readAt: Date | null;
    }>;
    markDoctorChatAsRead(clinicId: string, doctorId: string, patientId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    getDoctorChatConversationReplies(clinicId: string, doctorId: string, patientId: string): Promise<{
        doctorId: string;
        patientId: string;
        repliesEnabled: boolean;
    }>;
    updateDoctorChatConversationReplies(clinicId: string, doctorId: string, patientId: string, repliesEnabled: boolean): Promise<{
        id: string;
        doctorId: string;
        patientId: string;
        repliesEnabled: boolean;
    }>;
    setDoctorOnlineStatus(clinicId: string, doctorId: string, isOnline: boolean): Promise<{
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
    removeDoctor(clinicId: string, doctorId: string): Promise<void>;
    listAll(query: Record<string, unknown>): Promise<{
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
        meta: import("../../utils/pagination.js").PaginationMeta;
    }>;
    listPending(query: Record<string, unknown>): Promise<{
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
        meta: import("../../utils/pagination.js").PaginationMeta;
    }>;
    adminUpdate(id: string, data: Record<string, unknown>, adminName?: string): Promise<{
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
export declare const clinicsService: ClinicsService;
export {};
