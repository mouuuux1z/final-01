"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratingsController = exports.RatingsController = void 0;
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const asyncHandler_js_1 = require("../../utils/asyncHandler.js");
const params_js_1 = require("../../utils/params.js");
const ratings_service_js_1 = require("./ratings.service.js");
class RatingsController {
    submit = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await ratings_service_js_1.ratingsService.submit(req.user.id, (0, params_js_1.parseIdParam)(req.params.id, 'id'), req.body);
        (0, apiResponse_js_1.sendSuccess)(res, result, 'Rating submitted', 201);
    });
    getMyRating = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await ratings_service_js_1.ratingsService.getMyRating(req.user.id, (0, params_js_1.parseIdParam)(req.params.id, 'id'));
        (0, apiResponse_js_1.sendSuccess)(res, result);
    });
    listByDoctor = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
        const result = await ratings_service_js_1.ratingsService.listByDoctor((0, params_js_1.parseIdParam)(req.params.id, 'id'), req.query);
        (0, apiResponse_js_1.sendSuccess)(res, result);
    });
}
exports.RatingsController = RatingsController;
exports.ratingsController = new RatingsController();
//# sourceMappingURL=ratings.controller.js.map