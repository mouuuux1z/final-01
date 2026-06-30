"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clinicAuthMiddleware = void 0;
exports.clinicOnly = clinicOnly;
const client_1 = require("@prisma/client");
const AppError_js_1 = require("../utils/AppError.js");
const auth_middleware_js_1 = require("./auth.middleware.js");
exports.clinicAuthMiddleware = [auth_middleware_js_1.authMiddleware, (0, auth_middleware_js_1.requireUserTypes)(client_1.UserType.CLINIC)];
function clinicOnly(req, _res, next) {
    if (!req.user || req.user.userType !== client_1.UserType.CLINIC) {
        next(new AppError_js_1.AppError('Clinic access required', 403));
        return;
    }
    next();
}
//# sourceMappingURL=clinicAuth.middleware.js.map