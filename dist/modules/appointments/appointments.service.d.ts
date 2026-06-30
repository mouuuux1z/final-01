import { AttendanceStatus, UserType } from '@prisma/client';
export declare class AppointmentsService {
    book(patientId: string, data: {
        doctorId: string;
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
    getById(id: string, userId: string, userType: UserType): Promise<{
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
    listForUser(userId: string, userType: UserType, query: Record<string, unknown>): Promise<{
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
    processPastUnmarkedAppointments(filters?: {
        patientId?: string;
        doctorId?: string;
    }): Promise<void>;
    cancel(id: string, userId: string, userType: UserType): Promise<{
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
    reschedule(id: string, userId: string, userType: UserType, date: Date, time: string): Promise<{
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
    accept(id: string, doctorId: string): Promise<{
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
    reject(id: string, doctorId: string): Promise<{
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
    doctorManualBook(doctorId: string, data: {
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
    markAttendance(id: string, doctorId: string, attendanceStatus: AttendanceStatus): Promise<{
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
    private assertAccess;
    private notifyDoctor;
    private notifyPatient;
    private notifyPatientNoShow;
}
export declare const appointmentsService: AppointmentsService;
