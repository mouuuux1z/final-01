"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminDoctorRoutes = exports.doctorRouter = exports.publicDoctorRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const doctorActive_middleware_js_1 = require("../../middleware/doctorActive.middleware.js");
const adminAuth_middleware_js_1 = require("../../middleware/adminAuth.middleware.js");
const upload_middleware_js_1 = require("../../middleware/upload.middleware.js");
const validate_middleware_js_1 = require("../../middleware/validate.middleware.js");
const doctors_controller_js_1 = require("./doctors.controller.js");
const doctors_schema_js_1 = require("./doctors.schema.js");
const ratings_controller_js_1 = require("../ratings/ratings.controller.js");
const ratings_schema_js_1 = require("../ratings/ratings.schema.js");
const router = (0, express_1.Router)();
exports.publicDoctorRoutes = router;
router.get('/', (0, validate_middleware_js_1.validate)(doctors_schema_js_1.searchDoctorsSchema, 'query'), doctors_controller_js_1.doctorsController.search);
router.get('/:id/ratings', (0, validate_middleware_js_1.validate)(doctors_schema_js_1.doctorIdParamSchema, 'params'), (0, validate_middleware_js_1.validate)(ratings_schema_js_1.listRatingsQuerySchema, 'query'), ratings_controller_js_1.ratingsController.listByDoctor);
router.get('/:id/ratings/me', auth_middleware_js_1.authMiddleware, (0, auth_middleware_js_1.requireUserTypes)(client_1.UserType.PATIENT), (0, validate_middleware_js_1.validate)(doctors_schema_js_1.doctorIdParamSchema, 'params'), ratings_controller_js_1.ratingsController.getMyRating);
router.post('/:id/ratings', auth_middleware_js_1.authMiddleware, (0, auth_middleware_js_1.requireUserTypes)(client_1.UserType.PATIENT), (0, validate_middleware_js_1.validate)(doctors_schema_js_1.doctorIdParamSchema, 'params'), (0, validate_middleware_js_1.validate)(ratings_schema_js_1.submitRatingSchema), ratings_controller_js_1.ratingsController.submit);
router.get('/:id', (0, validate_middleware_js_1.validate)(doctors_schema_js_1.doctorIdParamSchema, 'params'), doctors_controller_js_1.doctorsController.getProfile);
router.get('/:id/availability', (0, validate_middleware_js_1.validate)(doctors_schema_js_1.doctorIdParamSchema, 'params'), (0, validate_middleware_js_1.validate)(doctors_schema_js_1.availabilityQuerySchema, 'query'), doctors_controller_js_1.doctorsController.getAvailability);
const doctorRouter = (0, express_1.Router)();
exports.doctorRouter = doctorRouter;
doctorRouter.use(auth_middleware_js_1.authMiddleware, (0, auth_middleware_js_1.requireUserTypes)(client_1.UserType.DOCTOR), doctorActive_middleware_js_1.requireActiveDoctor);
doctorRouter.get('/me', doctors_controller_js_1.doctorsController.getMe);
doctorRouter.patch('/me', upload_middleware_js_1.uploadImage.fields([
    { name: 'image', maxCount: 1 },
    { name: 'certificate', maxCount: 1 },
]), (0, validate_middleware_js_1.validate)(doctors_schema_js_1.updateDoctorSchema), doctors_controller_js_1.doctorsController.updateMe);
doctorRouter.patch('/me/online', (0, validate_middleware_js_1.validate)(doctors_schema_js_1.onlineStatusSchema), doctors_controller_js_1.doctorsController.setOnlineStatus);
doctorRouter.get('/me/schedules', doctors_controller_js_1.doctorsController.getSchedules);
doctorRouter.post('/me/schedules', (0, validate_middleware_js_1.validate)(doctors_schema_js_1.createScheduleSchema), doctors_controller_js_1.doctorsController.createSchedule);
doctorRouter.patch('/me/schedules/:scheduleId', (0, validate_middleware_js_1.validate)(doctors_schema_js_1.scheduleIdParamSchema, 'params'), (0, validate_middleware_js_1.validate)(doctors_schema_js_1.updateScheduleSchema), doctors_controller_js_1.doctorsController.updateSchedule);
doctorRouter.delete('/me/schedules/:scheduleId', (0, validate_middleware_js_1.validate)(doctors_schema_js_1.scheduleIdParamSchema, 'params'), doctors_controller_js_1.doctorsController.deleteSchedule);
doctorRouter.post('/me/availability', (0, validate_middleware_js_1.validate)(doctors_schema_js_1.createAvailabilitySlotSchema), doctors_controller_js_1.doctorsController.createAvailabilitySlot);
doctorRouter.post('/me/availability/generate', (0, validate_middleware_js_1.validate)(doctors_schema_js_1.generateAvailabilitySchema), doctors_controller_js_1.doctorsController.generateAvailability);
doctorRouter.post('/me/availability/generate-recurring', (0, validate_middleware_js_1.validate)(doctors_schema_js_1.generateRecurringAvailabilitySchema), doctors_controller_js_1.doctorsController.generateRecurringAvailability);
doctorRouter.get('/me/availability', (0, validate_middleware_js_1.validate)(doctors_schema_js_1.availabilityQuerySchema, 'query'), doctors_controller_js_1.doctorsController.getMyAvailability);
doctorRouter.post('/me/availability/bulk', (0, validate_middleware_js_1.validate)(doctors_schema_js_1.bulkAvailabilitySchema), doctors_controller_js_1.doctorsController.bulkCreateAvailability);
doctorRouter.delete('/me/availability/:slotId', (0, validate_middleware_js_1.validate)(doctors_schema_js_1.slotIdParamSchema, 'params'), doctors_controller_js_1.doctorsController.deleteAvailabilitySlot);
const adminRouter = (0, express_1.Router)();
exports.adminDoctorRoutes = adminRouter;
adminRouter.use(...adminAuth_middleware_js_1.adminAuthMiddleware);
adminRouter.get('/', (0, validate_middleware_js_1.validate)(doctors_schema_js_1.searchDoctorsSchema, 'query'), doctors_controller_js_1.doctorsController.adminList);
adminRouter.patch('/:id', (0, validate_middleware_js_1.validate)(doctors_schema_js_1.doctorIdParamSchema, 'params'), (0, validate_middleware_js_1.validate)(doctors_schema_js_1.adminUpdateDoctorSchema), doctors_controller_js_1.doctorsController.adminUpdate);
adminRouter.delete('/:id', (0, validate_middleware_js_1.validate)(doctors_schema_js_1.doctorIdParamSchema, 'params'), doctors_controller_js_1.doctorsController.adminDelete);
//# sourceMappingURL=doctors.routes.js.map