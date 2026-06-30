"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthMiddleware = void 0;
exports.adminOnly = adminOnly;
const client_1 = require("@prisma/client");
const AppError_js_1 = require("../utils/AppError.js");
const auth_middleware_js_1 = require("./auth.middleware.js");
exports.adminAuthMiddleware = [auth_middleware_js_1.authMiddleware, (0, auth_middleware_js_1.requireUserTypes)(client_1.UserType.ADMIN)];
function adminOnly(req, _res, next) {
    if (!req.user || req.user.userType !== client_1.UserType.ADMIN) {
        next(new AppError_js_1.AppError('Admin access required', 403));
        return;
    }
    next();
}
//# sourceMappingURL=adminAuth.middleware.js.map