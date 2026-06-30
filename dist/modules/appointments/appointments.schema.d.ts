import { z } from 'zod';
export declare const bookAppointmentSchema: z.ZodObject<{
    doctorId: z.ZodString;
    date: z.ZodEffects<z.ZodDate, Date, unknown>;
    time: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    patientName: z.ZodOptional<z.ZodString>;
    patientPhone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    doctorId?: string;
    date?: Date;
    time?: string;
    notes?: string;
    patientName?: string;
    patientPhone?: string;
}, {
    doctorId?: string;
    date?: unknown;
    time?: string;
    notes?: string;
    patientName?: string;
    patientPhone?: string;
}>;
export declare const doctorManualBookSchema: z.ZodObject<{
    patientName: z.ZodString;
    patientPhone: z.ZodOptional<z.ZodString>;
    date: z.ZodEffects<z.ZodDate, Date, unknown>;
    time: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    date?: Date;
    time?: string;
    notes?: string;
    patientName?: string;
    patientPhone?: string;
}, {
    date?: unknown;
    time?: string;
    notes?: string;
    patientName?: string;
    patientPhone?: string;
}>;
export declare const rescheduleAppointmentSchema: z.ZodObject<{
    date: z.ZodEffects<z.ZodDate, Date, unknown>;
    time: z.ZodString;
}, "strip", z.ZodTypeAny, {
    date?: Date;
    time?: string;
}, {
    date?: unknown;
    time?: string;
}>;
export declare const updateAppointmentStatusSchema: z.ZodObject<{
    status: z.ZodNativeEnum<{
        PENDING: "PENDING";
        CONFIRMED: "CONFIRMED";
        CANCELLED: "CANCELLED";
        COMPLETED: "COMPLETED";
        NO_SHOW: "NO_SHOW";
        REJECTED: "REJECTED";
    }>;
}, "strip", z.ZodTypeAny, {
    status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW" | "REJECTED";
}, {
    status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW" | "REJECTED";
}>;
export declare const updateAttendanceSchema: z.ZodObject<{
    attendanceStatus: z.ZodNativeEnum<{
        PENDING: "PENDING";
        ATTENDED: "ATTENDED";
        ABSENT: "ABSENT";
        LATE: "LATE";
    }>;
}, "strip", z.ZodTypeAny, {
    attendanceStatus?: "PENDING" | "ATTENDED" | "ABSENT" | "LATE";
}, {
    attendanceStatus?: "PENDING" | "ATTENDED" | "ABSENT" | "LATE";
}>;
export declare const appointmentIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id?: string;
}, {
    id?: string;
}>;
export declare const listAppointmentsQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodNativeEnum<{
        PENDING: "PENDING";
        CONFIRMED: "CONFIRMED";
        CANCELLED: "CANCELLED";
        COMPLETED: "COMPLETED";
        NO_SHOW: "NO_SHOW";
        REJECTED: "REJECTED";
    }>>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    from: z.ZodEffects<z.ZodOptional<z.ZodDate>, Date, unknown>;
    to: z.ZodEffects<z.ZodOptional<z.ZodDate>, Date, unknown>;
}, "strip", z.ZodTypeAny, {
    status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW" | "REJECTED";
    limit?: number;
    page?: number;
    from?: Date;
    to?: Date;
}, {
    status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW" | "REJECTED";
    limit?: number;
    page?: number;
    from?: unknown;
    to?: unknown;
}>;
