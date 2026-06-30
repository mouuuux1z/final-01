"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseIdParam = parseIdParam;
exports.parseOptionalString = parseOptionalString;
const AppError_js_1 = require("./AppError.js");
function parseIdParam(value, label = 'id') {
    const raw = Array.isArray(value) ? value[0] : value;
    if (!raw || raw.trim().length === 0) {
        throw new AppError_js_1.AppError(`Invalid ${label}`, 400);
    }
    return raw;
}
function parseOptionalString(value) {
    if (typeof value !== 'string')
        return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}
//# sourceMappingURL=params.js.map