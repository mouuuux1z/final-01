"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
function sendSuccess(res, data, message = 'Success', statusCode = 200) {
    res.status(statusCode).json({ success: true, message, data });
}
function sendError(res, message, statusCode = 400, errors) {
    res.status(statusCode).json({ success: false, message, errors });
}
//# sourceMappingURL=apiResponse.js.map