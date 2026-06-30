"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOOKING_BLOCK_DAYS = exports.ATTENDANCE_COMMITMENT_DEDUCTION = exports.ATTENDANCE_COMMITMENT_MAX = void 0;
exports.normalizeCommitmentPoints = normalizeCommitmentPoints;
exports.ATTENDANCE_COMMITMENT_MAX = 3;
exports.ATTENDANCE_COMMITMENT_DEDUCTION = 1;
exports.BOOKING_BLOCK_DAYS = 7;
function normalizeCommitmentPoints(points) {
    if (points == null)
        return exports.ATTENDANCE_COMMITMENT_MAX;
    return Math.min(exports.ATTENDANCE_COMMITMENT_MAX, Math.max(0, points));
}
//# sourceMappingURL=attendance.js.map