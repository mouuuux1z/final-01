import type { Socket } from 'socket.io';
import type { JwtPayload } from '../../utils/jwt.js';
export interface AuthenticatedSocket extends Socket {
    user?: JwtPayload;
}
export declare function socketAuthMiddleware(socket: AuthenticatedSocket, next: (err?: Error) => void): Promise<void>;
