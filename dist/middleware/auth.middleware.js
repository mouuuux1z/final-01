"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.requireUserTypes = requireUserTypes;
const database_js_1 = require("../config/database.js");
const AppError_js_1 = require("../utils/AppError.js");
const jwt_js_1 = require("../utils/jwt.js");
async function authMiddleware(req, _res, next) {
    try {
        const header = req.headers.authorization;
        if (!header?.startsWith('Bearer ')) {
            throw new AppError_js_1.AppError('Authentication required', 401);
        }
        const token = header.slice(7);
        const payload = (0, jwt_js_1.verifyToken)(token);
        const session = await database_js_1.prisma.session.findUnique({ where: { token } });
        if (!session || session.expiresAt < new Date()) {
            if (session) {
                await database_js_1.prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
            }
            throw new AppError_js_1.AppError('Session expired', 401);
        }
        if (session.userId !== payload.userId || session.userType !== payload.userType) {
            throw new AppError_js_1.AppError('Invalid session', 401);
        }
        req.user = {
            id: payload.userId,
            userType: payload.userType,
            sessionId: session.id,
        };
        next();
    }
    catch (error) {
        if (error instanceof AppError_js_1.AppError) {
            next(error);
            return;
        }
        next(new AppError_js_1.AppError('Invalid or expired token', 401));
    }
}
function requireUserTypes(...allowedTypes) {
    return (req, _res, next) => {
        if (!req.user || !allowedTypes.includes(req.user.userType)) {
            next(new AppError_js_1.AppError('Forbidden', 403));
            return;
        }
        next();
    };
}
//# sourceMappingURL=auth.middleware.js.map