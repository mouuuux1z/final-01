import type { UserType } from '@prisma/client';
import type { SocketEvent } from './events.js';
export declare function emitToUser(userType: UserType, userId: string, event: SocketEvent, data: unknown): void;
export declare function emitToChat(doctorId: string, patientId: string, event: SocketEvent, data: unknown): void;
export declare function emitToRoom(room: string, event: SocketEvent, data: unknown): void;
