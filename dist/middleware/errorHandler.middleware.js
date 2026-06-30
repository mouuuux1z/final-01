"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const AppError_js_1 = require("../utils/AppError.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
function errorHandler(err, _req, res, _next) {
    if (err instanceof AppError_js_1.AppError) {
        (0, apiResponse_js_1.sendError)(res, err.message, err.statusCode);
        return;
    }
    if (err.name === 'MulterError') {
        (0, apiResponse_js_1.sendError)(res, 'File upload failed. Please upload a valid certificate file.', 400);
        return;
    }
    if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
        (0, apiResponse_js_1.sendError)(res, 'Invalid request body', 400);
        return;
    }
    if (err instanceof zod_1.ZodError) {
        (0, apiResponse_js_1.sendError)(res, 'Validation failed', 422, err.flatten().fieldErrors);
        return;
    }
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        (0, apiResponse_js_1.sendError)(res, 'Invalid or expired token', 401);
        return;
    }
    console.error('Unhandled error:', err);
    (0, apiResponse_js_1.sendError)(res, 'Internal server error', 500);
}
//# sourceMappingURL=errorHandler.middleware.js.map