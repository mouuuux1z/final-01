import { z } from 'zod';
export declare const updateClinicSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    specialization: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    location?: string;
    city?: string;
    specialization?: string;
    phone?: string;
}, {
    name?: string;
    location?: string;
    city?: string;
    specialization?: string;
    phone?: string;
}>;
export declare const adminUpdateClinicSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    specialization: z.ZodOptional<z.ZodString>;
} & {
    status: z.ZodOptional<z.ZodNativeEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        PENDING: "PENDING";
        SUSPENDED: "SUSPENDED";
        DISABLED: "DISABLED";
    }>>;
}, "strip", z.ZodTypeAny, {
    status?: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED" | "DISABLED";
    name?: string;
    location?: string;
    city?: string;
    specialization?: string;
    phone?: string;
}, {
    status?: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED" | "DISABLED";
    name?: string;
    location?: string;
    city?: string;
    specialization?: string;
    phone?: string;
}>;
export declare const assignDoctorSchema: z.ZodObject<{
    doctorId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    doctorId?: string;
}, {
    doctorId?: string;
}>;
export declare const createClinicDoctorSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    phone: z.ZodString;
    specialization: z.ZodString;
    city: z.ZodString;
    location: z.ZodString;
    clinicInfo: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    email?: string;
    password?: string;
    location?: string;
    city?: string;
    specialization?: string;
    phone?: string;
    clinicInfo?: string;
    description?: string;
}, {
    name?: string;
    email?: string;
    password?: string;
    location?: string;
    city?: string;
    specialization?: string;
    phone?: string;
    clinicInfo?: string;
    description?: string;
}>;
export declare const clinicDoctorStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["ACTIVE", "DISABLED"]>;
    disableReason: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: "ACTIVE" | "DISABLED";
    disableReason?: string;
}, {
    status?: "ACTIVE" | "DISABLED";
    disableReason?: string;
}>;
export declare const clinicIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id?: string;
}, {
    id?: string;
}>;
export declare const clinicListQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        PENDING: "PENDING";
        SUSPENDED: "SUSPENDED";
        DISABLED: "DISABLED";
    }>>;
}, "strip", z.ZodTypeAny, {
    status?: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED" | "DISABLED";
    limit?: number;
    page?: number;
}, {
    status?: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED" | "DISABLED";
    limit?: number;
    page?: number;
}>;
