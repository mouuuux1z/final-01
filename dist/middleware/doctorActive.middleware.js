"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireActiveDoctor = requireActiveDoctor;
const client_1 = require("@prisma/client");
const database_js_1 = require("../config/database.js");
const AppError_js_1 = require("../utils/AppError.js");
async function requireActiveDoctor(req, _res, next) {
    try {
        if (!req.user || req.user.userType !== client_1.UserType.DOCTOR) {
            next();
            return;
        }
        const doctor = await database_js_1.prisma.doctor.findUnique({
            where: { id: req.user.id },
            select: { status: true },
        });
        if (!doctor || doctor.status !== client_1.EntityStatus.ACTIVE) {
            next(new AppError_js_1.AppError('Doctor account is not active', 403));
            return;
        }
        next();
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=doctorActive.middleware.js.map