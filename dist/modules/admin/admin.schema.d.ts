import { z } from 'zod';
export declare const createAdminSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodOptional<z.ZodNativeEnum<{
        SUPER_ADMIN: "SUPER_ADMIN";
        ADMIN: "ADMIN";
        MODERATOR: "MODERATOR";
    }>>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    email?: string;
    password?: string;
    role?: "ADMIN" | "SUPER_ADMIN" | "MODERATOR";
}, {
    name?: string;
    email?: string;
    password?: string;
    role?: "ADMIN" | "SUPER_ADMIN" | "MODERATOR";
}>;
export declare const verifyDoctorSchema: z.ZodObject<{
    status: z.ZodNativeEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        PENDING: "PENDING";
        SUSPENDED: "SUSPENDED";
        DISABLED: "DISABLED";
    }>;
    disableReason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED" | "DISABLED";
    disableReason?: string;
}, {
    status?: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED" | "DISABLED";
    disableReason?: string;
}>;
export declare const updateComplaintSchema: z.ZodObject<{
    status: z.ZodNativeEnum<{
        OPEN: "OPEN";
        IN_PROGRESS: "IN_PROGRESS";
        RESOLVED: "RESOLVED";
        CLOSED: "CLOSED";
    }>;
}, "strip", z.ZodTypeAny, {
    status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
}, {
    status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
}>;
export declare const siteContentSchema: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodString;
}, "strip", z.ZodTypeAny, {
    value?: string;
    key?: string;
}, {
    value?: string;
    key?: string;
}>;
export declare const analyticsQuerySchema: z.ZodObject<{
    from: z.ZodOptional<z.ZodDate>;
    to: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    from?: Date;
    to?: Date;
}, {
    from?: Date;
    to?: Date;
}>;
export declare const complaintIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id?: string;
}, {
    id?: string;
}>;
export declare const userListQuerySchema: z.ZodObject<{
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
