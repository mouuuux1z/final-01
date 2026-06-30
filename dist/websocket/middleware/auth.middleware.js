"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthMiddleware = socketAuthMiddleware;
const database_js_1 = require("../../config/database.js");
const jwt_js_1 = require("../../utils/jwt.js");
async function socketAuthMiddleware(socket, next) {
    try {
        const token = socket.handshake.auth?.token ??
            (socket.handshake.headers.authorization?.startsWith('Bearer ')
                ? socket.handshake.headers.authorization.slice(7)
                : undefined);
        if (!token) {
            next(new Error('Authentication required'));
            return;
        }
        const payload = (0, jwt_js_1.verifyToken)(token);
        const session = await database_js_1.prisma.session.findUnique({ where: { token } });
        if (!session || session.expiresAt < new Date()) {
            next(new Error('Invalid session'));
            return;
        }
        socket.user = payload;
        next();
    }
    catch {
        next(new Error('Authentication failed'));
    }
}
//# sourceMappingURL=auth.middleware.js.map