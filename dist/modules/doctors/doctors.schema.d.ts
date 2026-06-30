import { z } from 'zod';
export declare const searchDoctorsSchema: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    specialization: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit?: number;
    city?: string;
    specialization?: string;
    q?: string;
    page?: number;
}, {
    limit?: number;
    city?: string;
    specialization?: string;
    q?: string;
    page?: number;
}>;
export declare const updateDoctorSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    specialization: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    clinicInfo: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    clinicId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    location?: string;
    city?: string;
    specialization?: string;
    phone?: string;
    clinicInfo?: string;
    description?: string;
    clinicId?: string;
}, {
    name?: string;
    location?: string;
    city?: string;
    specialization?: string;
    phone?: string;
    clinicInfo?: string;
    description?: string;
    clinicId?: string;
}>;
export declare const adminUpdateDoctorSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    specialization: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    clinicInfo: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    clinicId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
} & {
    status: z.ZodOptional<z.ZodNativeEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        PENDING: "PENDING";
        SUSPENDED: "SUSPENDED";
        DISABLED: "DISABLED";
    }>>;
    disableReason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED" | "DISABLED";
    name?: string;
    location?: string;
    city?: string;
    specialization?: string;
    phone?: string;
    clinicInfo?: string;
    description?: string;
    disableReason?: string;
    clinicId?: string;
}, {
    status?: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED" | "DISABLED";
    name?: string;
    location?: string;
    city?: string;
    specialization?: string;
    phone?: string;
    clinicInfo?: string;
    description?: string;
    disableReason?: string;
    clinicId?: string;
}>;
export declare const createScheduleSchema: z.ZodObject<{
    dayOfWeek: z.ZodNativeEnum<{
        SATURDAY: "SATURDAY";
        SUNDAY: "SUNDAY";
        MONDAY: "MONDAY";
        TUESDAY: "TUESDAY";
        WEDNESDAY: "WEDNESDAY";
        THURSDAY: "THURSDAY";
        FRIDAY: "FRIDAY";
    }>;
    startTime: z.ZodString;
    endTime: z.ZodString;
}, "strip", z.ZodTypeAny, {
    dayOfWeek?: "SATURDAY" | "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";
    startTime?: string;
    endTime?: string;
}, {
    dayOfWeek?: "SATURDAY" | "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";
    startTime?: string;
    endTime?: string;
}>;
export declare const updateScheduleSchema: z.ZodObject<{
    dayOfWeek: z.ZodOptional<z.ZodNativeEnum<{
        SATURDAY: "SATURDAY";
        SUNDAY: "SUNDAY";
        MONDAY: "MONDAY";
        TUESDAY: "TUESDAY";
        WEDNESDAY: "WEDNESDAY";
        THURSDAY: "THURSDAY";
        FRIDAY: "FRIDAY";
    }>>;
    startTime: z.ZodOptional<z.ZodString>;
    endTime: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    dayOfWeek?: "SATURDAY" | "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";
    startTime?: string;
    endTime?: string;
}, {
    dayOfWeek?: "SATURDAY" | "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";
    startTime?: string;
    endTime?: string;
}>;
export declare const createAvailabilitySlotSchema: z.ZodObject<{
    date: z.ZodDate;
    time: z.ZodString;
}, "strip", z.ZodTypeAny, {
    date?: Date;
    time?: string;
}, {
    date?: Date;
    time?: string;
}>;
export declare const bulkAvailabilitySchema: z.ZodObject<{
    date: z.ZodDate;
    times: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    date?: Date;
    times?: string[];
}, {
    date?: Date;
    times?: string[];
}>;
export declare const generateAvailabilitySchema: z.ZodEffects<z.ZodObject<{
    date: z.ZodDate;
    startTime: z.ZodPipeline<z.ZodEffects<z.ZodString, string, string>, z.ZodString>;
    endTime: z.ZodPipeline<z.ZodEffects<z.ZodString, string, string>, z.ZodString>;
    slotDurationMinutes: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    gapMinutes: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    breakStart: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string>;
    breakEnd: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string>;
}, "strip", z.ZodTypeAny, {
    date?: Date;
    startTime?: string;
    endTime?: string;
    slotDurationMinutes?: number;
    gapMinutes?: number;
    breakStart?: string;
    breakEnd?: string;
}, {
    date?: Date;
    startTime?: string;
    endTime?: string;
    slotDurationMinutes?: number;
    gapMinutes?: number;
    breakStart?: string;
    breakEnd?: string;
}>, {
    date?: Date;
    startTime?: string;
    endTime?: string;
    slotDurationMinutes?: number;
    gapMinutes?: number;
    breakStart?: string;
    breakEnd?: string;
}, {
    date?: Date;
    startTime?: string;
    endTime?: string;
    slotDurationMinutes?: number;
    gapMinutes?: number;
    breakStart?: string;
    breakEnd?: string;
}>;
export declare const onlineStatusSchema: z.ZodObject<{
    isOnline: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    isOnline?: boolean;
}, {
    isOnline?: boolean;
}>;
export declare const doctorIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id?: string;
}, {
    id?: string;
}>;
export declare const scheduleIdParamSchema: z.ZodObject<{
    scheduleId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    scheduleId?: string;
}, {
    scheduleId?: string;
}>;
export declare const slotIdParamSchema: z.ZodObject<{
    slotId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    slotId?: string;
}, {
    slotId?: string;
}>;
export type GenerateAvailabilityInput = z.infer<typeof generateAvailabilitySchema>;
export declare const generateRecurringAvailabilitySchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    daysOfWeek: z.ZodArray<z.ZodNativeEnum<{
        SATURDAY: "SATURDAY";
        SUNDAY: "SUNDAY";
        MONDAY: "MONDAY";
        TUESDAY: "TUESDAY";
        WEDNESDAY: "WEDNESDAY";
        THURSDAY: "THURSDAY";
        FRIDAY: "FRIDAY";
    }>, "many">;
    startTime: z.ZodPipeline<z.ZodEffects<z.ZodString, string, string>, z.ZodString>;
    endTime: z.ZodPipeline<z.ZodEffects<z.ZodString, string, string>, z.ZodString>;
    slotDurationMinutes: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    gapMinutes: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    breakStart: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string>;
    breakEnd: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string>;
    weeksAhead: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    startTime?: string;
    endTime?: string;
    slotDurationMinutes?: number;
    gapMinutes?: number;
    breakStart?: string;
    breakEnd?: string;
    daysOfWeek?: ("SATURDAY" | "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY")[];
    weeksAhead?: number;
}, {
    startTime?: string;
    endTime?: string;
    slotDurationMinutes?: number;
    gapMinutes?: number;
    breakStart?: string;
    breakEnd?: string;
    daysOfWeek?: ("SATURDAY" | "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY")[];
    weeksAhead?: number;
}>, {
    startTime?: string;
    endTime?: string;
    slotDurationMinutes?: number;
    gapMinutes?: number;
    breakStart?: string;
    breakEnd?: string;
    daysOfWeek?: ("SATURDAY" | "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY")[];
    weeksAhead?: number;
}, {
    startTime?: string;
    endTime?: string;
    slotDurationMinutes?: number;
    gapMinutes?: number;
    breakStart?: string;
    breakEnd?: string;
    daysOfWeek?: ("SATURDAY" | "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY")[];
    weeksAhead?: number;
}>, {
    startTime?: string;
    endTime?: string;
    slotDurationMinutes?: number;
    gapMinutes?: number;
    breakStart?: string;
    breakEnd?: string;
    daysOfWeek?: ("SATURDAY" | "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY")[];
    weeksAhead?: number;
}, {
    startTime?: string;
    endTime?: string;
    slotDurationMinutes?: number;
    gapMinutes?: number;
    breakStart?: string;
    breakEnd?: string;
    daysOfWeek?: ("SATURDAY" | "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY")[];
    weeksAhead?: number;
}>;
export type GenerateRecurringAvailabilityInput = z.infer<typeof generateRecurringAvailabilitySchema>;
export declare const availabilityQuerySchema: z.ZodObject<{
    date: z.ZodEffects<z.ZodOptional<z.ZodDate>, Date, unknown>;
    from: z.ZodEffects<z.ZodOptional<z.ZodDate>, Date, unknown>;
    to: z.ZodEffects<z.ZodOptional<z.ZodDate>, Date, unknown>;
    availableOnly: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    date?: Date;
    from?: Date;
    to?: Date;
    availableOnly?: boolean;
}, {
    date?: unknown;
    from?: unknown;
    to?: unknown;
    availableOnly?: boolean;
}>;
