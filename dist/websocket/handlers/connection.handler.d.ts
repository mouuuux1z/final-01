import type { AuthenticatedSocket } from '../middleware/auth.middleware.js';
export declare function handleConnection(socket: AuthenticatedSocket): void;
export declare function joinChatRoom(socket: AuthenticatedSocket, doctorId: string, patientId: string): void;
