"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientIdParamSchema = exports.updatePatientSchema = void 0;
const zod_1 = require("zod");
exports.updatePatientSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    phone: zod_1.z.string().min(8).max(20).optional(),
});
exports.patientIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
//# sourceMappingURL=patients.schema.js.map