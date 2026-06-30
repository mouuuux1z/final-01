declare const router: import("express-serve-static-core").Router;
declare const doctorRouter: import("express-serve-static-core").Router;
declare const adminRouter: import("express-serve-static-core").Router;
export { router as publicDoctorRoutes, doctorRouter, adminRouter as adminDoctorRoutes };
