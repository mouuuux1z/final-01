import { AppointmentStatus } from '@prisma/client';
import type { PaginationParams } from '../../utils/pagination.js';
export declare class AppointmentsRepository {
    private dateOnlyRange;
    findById(id: string): Promise<{
        doctor: {
            name: string;
            id: string;
            location: string;
            city: string;
            specialization: string;
            phone: string;
            image: string;
        };
        patient: {
            name: string;
            id: string;
            email: string;
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
    }>;
    findMany(filters: {
        patientId?: string;
        doctorId?: string;
        status?: AppointmentStatus;
        from?: Date;
        to?: Date;
    }, pagination: PaginationParams): Promise<{
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
        total: number;
    }>;
    create(data: {
        doctorId: string;
        patientId: string;
        date: Date;
        time: string;
        notes?: string;
        patientName?: string;
        patientPhone?: string;
    }): Promise<{
        doctor: {
            name: string;
            id: string;
            location: string;
            city: string;
            specialization: string;
            phone: string;
            image: string;
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
    updateStatus(id: string, status: AppointmentStatus): Promise<{
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
    createDoctorManual(data: {
        doctorId: string;
        patientName: string;
        patientPhone?: string;
        date: Date;
        time: string;
        notes?: string;
    }): Promise<{
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
    updateAttendance(id: string, attendanceStatus: string, status?: AppointmentStatus): Promise<{
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
    cancel(id: string): Promise<{
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
    reject(id: string): Promise<{
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
    reschedule(id: string, date: Date, time: string): Promise<{
        doctor: {
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
}
export declare const appointmentsRepository: AppointmentsRepository;
