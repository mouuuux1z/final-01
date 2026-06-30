export declare function releaseExpiredBookingBlock(patientId: string): Promise<boolean>;
export declare function applyNoShowPenalty(patientId: string): Promise<{
    attendancePoints: number;
    bookingBlockedUntil: Date | null;
    blocked: boolean;
}>;
export declare function assertPatientCanBook(patientId: string): Promise<void>;
export declare function syncPatientCommitmentState(patientId: string): Promise<{
    status: import("@prisma/client").$Enums.EntityStatus;
    name: string;
    id: string;
    email: string;
    phone: string;
    attendancePoints: number;
    bookingBlockedUntil: Date;
}>;
