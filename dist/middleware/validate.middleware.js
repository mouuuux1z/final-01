"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
function normalizeRequestPart(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return value;
    }
    const normalized = {};
    for (const [key, partValue] of Object.entries(value)) {
        normalized[key] = Array.isArray(partValue) ? partValue[0] : partValue;
    }
    return normalized;
}
function validate(schema, part = 'body') {
    return (req, _res, next) => {
        const result = schema.safeParse(normalizeRequestPart(req[part]));
        if (!result.success) {
            next(result.error);
            return;
        }
        req[part] = result.data;
        next();
    };
}
//# sourceMappingURL=validate.middleware.js.map