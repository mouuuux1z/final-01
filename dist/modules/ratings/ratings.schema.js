"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRatingsQuerySchema = exports.submitRatingSchema = void 0;
const zod_1 = require("zod");
exports.submitRatingSchema = zod_1.z.object({
    rating: zod_1.z.coerce.number().int().min(1).max(5),
    comment: zod_1.z.string().max(500).optional(),
});
exports.listRatingsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().optional(),
    limit: zod_1.z.coerce.number().optional(),
});
//# sourceMappingURL=ratings.schema.js.map