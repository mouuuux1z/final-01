"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.releaseExpiredBookingBlock = releaseExpiredBookingBlock;
exports.applyNoShowPenalty = applyNoShowPenalty;
exports.assertPatientCanBook = assertPatientCanBook;
exports.syncPatientCommitmentState = syncPatientCommitmentState;
const client_1 = require("@prisma/client");
const database_js_1 = require("../config/database.js");
const AppError_js_1 = require("../utils/AppError.js");
const attendance_js_1 = require("../constants/attendance.js");
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
async function releaseExpiredBookingBlock(patientId) {
    const patient = await database_js_1.prisma.patient.findUnique({
        where: { id: patientId },
        select: { bookingBlockedUntil: true },
    });
    if (!patient?.bookingBlockedUntil || patient.bookingBlockedUntil > new Date()) {
        return false;
    }
    await database_js_1.prisma.patient.update({
        where: { id: patientId },
        data: {
            bookingBlockedUntil: null,
            attendancePoints: attendance_js_1.ATTENDANCE_COMMITMENT_MAX,
        },
    });
    await database_js_1.prisma.notification.create({
        data: {
            targetType: client_1.NotificationTargetType.PATIENT,
            targetId: patientId,
            title: 'Commitment score restored',
            message: `Your commitment score has been restored to ${attendance_js_1.ATTENDANCE_COMMITMENT_MAX} points. You can book appointments again.`,
            type: client_1.NotificationType.SYSTEM,
        },
    });
    return true;
}
async function applyNoShowPenalty(patientId) {
    await releaseExpiredBookingBlock(patientId);
    const patient = await database_js_1.prisma.patient.findUnique({
        where: { id: patientId },
        select: { attendancePoints: true, bookingBlockedUntil: true },
    });
    if (!patient) {
        throw new AppError_js_1.AppError('Patient not found', 404);
    }
    if (patient.bookingBlockedUntil && patient.bookingBlockedUntil > new Date()) {
        return {
            attendancePoints: (0, attendance_js_1.normalizeCommitmentPoints)(patient.attendancePoints),
            bookingBlockedUntil: patient.bookingBlockedUntil,
            blocked: true,
        };
    }
    const current = (0, attendance_js_1.normalizeCommitmentPoints)(patient.attendancePoints);
    const nextPoints = Math.max(0, current - attendance_js_1.ATTENDANCE_COMMITMENT_DEDUCTION);
    const bookingBlockedUntil = nextPoints === 0 ? addDays(new Date(), attendance_js_1.BOOKING_BLOCK_DAYS) : null;
    await database_js_1.prisma.patient.update({
        where: { id: patientId },
        data: {
            attendancePoints: nextPoints,
            bookingBlockedUntil,
        },
    });
    if (bookingBlockedUntil) {
        await database_js_1.prisma.notification.create({
            data: {
                targetType: client_1.NotificationTargetType.PATIENT,
                targetId: patientId,
                title: 'Booking suspended',
                message: `Your commitment score reached zero. Booking is blocked for ${attendance_js_1.BOOKING_BLOCK_DAYS} days.`,
                type: client_1.NotificationType.SYSTEM,
            },
        });
    }
    return {
        attendancePoints: nextPoints,
        bookingBlockedUntil,
        blocked: bookingBlockedUntil !== null,
    };
}
async function assertPatientCanBook(patientId) {
    await releaseExpiredBookingBlock(patientId);
    const patient = await database_js_1.prisma.patient.findUnique({
        where: { id: patientId },
        select: { status: true, bookingBlockedUntil: true },
    });
    if (!patient) {
        throw new AppError_js_1.AppError('Patient not found', 404);
    }
    if (patient.bookingBlockedUntil && patient.bookingBlockedUntil > new Date()) {
        throw new AppError_js_1.AppError('Commitment booking block active', 403);
    }
}
async function syncPatientCommitmentState(patientId) {
    await releaseExpiredBookingBlock(patientId);
    return database_js_1.prisma.patient.findUnique({
        where: { id: patientId },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
            attendancePoints: true,
            bookingBlockedUntil: true,
        },
    });
}
//# sourceMappingURL=commitment.service.js.map