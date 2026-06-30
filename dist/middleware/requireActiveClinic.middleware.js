"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireActiveClinic = requireActiveClinic;
const client_1 = require("@prisma/client");
const database_js_1 = require("../config/database.js");
const AppError_js_1 = require("../utils/AppError.js");
async function requireActiveClinic(req, _res, next) {
    try {
        const clinic = await database_js_1.prisma.clinic.findUnique({
            where: { id: req.user.id },
            select: { status: true },
        });
        if (!clinic) {
            next(new AppError_js_1.AppError('Clinic not found', 404));
            return;
        }
        if (clinic.status !== client_1.EntityStatus.ACTIVE) {
            next(new AppError_js_1.AppError('Clinic account is not active', 403));
            return;
        }
        next();
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=requireActiveClinic.middleware.js.map