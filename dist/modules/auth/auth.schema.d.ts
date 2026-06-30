import { z } from 'zod';
export declare const registerSchema: z.ZodDiscriminatedUnion<"userType", [z.ZodObject<{
    userType: z.ZodLiteral<"PATIENT">;
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    phone: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name?: string;
    userType?: "PATIENT";
    email?: string;
    password?: string;
    phone?: string;
}, {
    name?: string;
    userType?: "PATIENT";
    email?: string;
    password?: string;
    phone?: string;
}>, z.ZodObject<{
    userType: z.ZodLiteral<"DOCTOR">;
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    phone: z.ZodString;
    specialization: z.ZodString;
    city: z.ZodString;
    location: z.ZodString;
    clinicInfo: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    clinicId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    userType?: "DOCTOR";
    email?: string;
    password?: string;
    location?: string;
    city?: string;
    specialization?: string;
    phone?: string;
    clinicInfo?: string;
    description?: string;
    clinicId?: string;
}, {
    name?: string;
    userType?: "DOCTOR";
    email?: string;
    password?: string;
    location?: string;
    city?: string;
    specialization?: string;
    phone?: string;
    clinicInfo?: string;
    description?: string;
    clinicId?: string;
}>, z.ZodObject<{
    userType: z.ZodLiteral<"CLINIC">;
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    phone: z.ZodString;
    location: z.ZodString;
    city: z.ZodString;
    specialization: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name?: string;
    userType?: "CLINIC";
    email?: string;
    password?: string;
    location?: string;
    city?: string;
    specialization?: string;
    phone?: string;
}, {
    name?: string;
    userType?: "CLINIC";
    email?: string;
    password?: string;
    location?: string;
    city?: string;
    specialization?: string;
    phone?: string;
}>]>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodEffects<z.ZodString, string, string>;
    password: z.ZodString;
    userType: z.ZodOptional<z.ZodNativeEnum<{
        ADMIN: "ADMIN";
        CLINIC: "CLINIC";
        DOCTOR: "DOCTOR";
        PATIENT: "PATIENT";
    }>>;
}, "strip", z.ZodTypeAny, {
    userType?: "ADMIN" | "CLINIC" | "DOCTOR" | "PATIENT";
    email?: string;
    password?: string;
}, {
    userType?: "ADMIN" | "CLINIC" | "DOCTOR" | "PATIENT";
    email?: string;
    password?: string;
}>;
export declare const doctorRegisterMultipartSchema: z.ZodObject<{
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
export declare const clinicRegisterMultipartSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    phone: z.ZodString;
    city: z.ZodString;
    location: z.ZodString;
    specialization: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name?: string;
    email?: string;
    password?: string;
    location?: string;
    city?: string;
    specialization?: string;
    phone?: string;
}, {
    name?: string;
    email?: string;
    password?: string;
    location?: string;
    city?: string;
    specialization?: string;
    phone?: string;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ClinicRegisterInput = z.infer<typeof clinicRegisterMultipartSchema>;
