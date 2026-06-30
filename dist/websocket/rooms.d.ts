import type { UserType } from '@prisma/client';
export declare function userRoom(userType: UserType, userId: string): string;
export declare function chatRoom(doctorId: string, patientId: string): string;
export declare function doctorRoom(doctorId: string): string;
export declare function clinicRoom(clinicId: string): string;
export declare function adminRoom(): string;
