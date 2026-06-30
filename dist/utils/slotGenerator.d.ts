import type { DayOfWeek } from '@prisma/client';
export declare function parseTimeToMinutes(time: string): number;
export declare function formatMinutesToTime(minutes: number): string;
export declare function normalizeTimeString(time: string): string;
export declare function slotsOverlap(startA: number, durationA: number, startB: number, durationB: number): boolean;
export declare function generateSlotTimes(params: {
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    gapMinutes?: number;
    breakStart?: string;
    breakEnd?: string;
}): string[];
export declare function dateToDayOfWeek(date: Date): DayOfWeek;
export declare function normalizeDateOnly(date: Date): Date;
export declare function parseLocalDateInput(input: unknown): Date | undefined;
export declare function addDaysLocal(date: Date, days: number): Date;
export declare function getAppointmentDateTime(date: Date, time: string): Date;
