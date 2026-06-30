export interface JwtPayload {
    userId: string;
    userType: string;
    sessionId: string;
}
export declare function signToken(payload: JwtPayload): string;
export declare function verifyToken(token: string): JwtPayload;
