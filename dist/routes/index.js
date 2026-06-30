"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_js_1 = __importDefault(require("../modules/auth/auth.routes.js"));
const doctors_routes_js_1 = require("../modules/doctors/doctors.routes.js");
const patients_routes_js_1 = require("../modules/patients/patients.routes.js");
const appointments_routes_js_1 = __importDefault(require("../modules/appointments/appointments.routes.js"));
const clinics_routes_js_1 = require("../modules/clinics/clinics.routes.js");
const admin_routes_js_1 = __importDefault(require("../modules/admin/admin.routes.js"));
const chat_routes_js_1 = __importDefault(require("../modules/chat/chat.routes.js"));
const notifications_routes_js_1 = __importDefault(require("../modules/notifications/notifications.routes.js"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_js_1.default);
router.use('/doctors', doctors_routes_js_1.publicDoctorRoutes);
router.use('/doctor', doctors_routes_js_1.doctorRouter);
router.use('/patients', patients_routes_js_1.patientRoutes);
router.use('/appointments', appointments_routes_js_1.default);
router.use('/clinics', clinics_routes_js_1.clinicRoutes);
router.use('/chat', chat_routes_js_1.default);
router.use('/notifications', notifications_routes_js_1.default);
router.use('/admin', admin_routes_js_1.default);
router.use('/admin/doctors', doctors_routes_js_1.adminDoctorRoutes);
router.use('/admin/patients', patients_routes_js_1.adminPatientRoutes);
router.use('/admin/clinics', clinics_routes_js_1.adminClinicRoutes);
exports.default = router;
//# sourceMappingURL=index.js.map