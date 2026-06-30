"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rateLimit_middleware_js_1 = require("../../middleware/rateLimit.middleware.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const upload_middleware_js_1 = require("../../middleware/upload.middleware.js");
const validate_middleware_js_1 = require("../../middleware/validate.middleware.js");
const auth_controller_js_1 = require("./auth.controller.js");
const auth_schema_js_1 = require("./auth.schema.js");
const router = (0, express_1.Router)();
router.post('/register', rateLimit_middleware_js_1.authRateLimit, (0, validate_middleware_js_1.validate)(auth_schema_js_1.registerSchema), auth_controller_js_1.authController.register);
router.post('/register/doctor', rateLimit_middleware_js_1.authRateLimit, upload_middleware_js_1.uploadCertificate.single('certificate'), (0, validate_middleware_js_1.validate)(auth_schema_js_1.doctorRegisterMultipartSchema), auth_controller_js_1.authController.registerDoctor);
router.post('/register/clinic', rateLimit_middleware_js_1.authRateLimit, upload_middleware_js_1.uploadCertificate.single('certificate'), (0, validate_middleware_js_1.validate)(auth_schema_js_1.clinicRegisterMultipartSchema), auth_controller_js_1.authController.registerClinic);
router.post('/login', rateLimit_middleware_js_1.authRateLimit, (0, validate_middleware_js_1.validate)(auth_schema_js_1.loginSchema), auth_controller_js_1.authController.login);
router.post('/logout', auth_middleware_js_1.authMiddleware, auth_controller_js_1.authController.logout);
router.get('/me', auth_middleware_js_1.authMiddleware, auth_controller_js_1.authController.me);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map