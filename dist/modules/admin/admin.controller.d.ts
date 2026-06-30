import type { Request, Response } from 'express';
export declare class AdminController {
    analytics: (req: Request, res: Response, next: import("express").NextFunction) => void;
    listComplaints: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateComplaint: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getSiteContent: (req: Request, res: Response, next: import("express").NextFunction) => void;
    upsertSiteContent: (req: Request, res: Response, next: import("express").NextFunction) => void;
    verifyDoctor: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createAdmin: (req: Request, res: Response, next: import("express").NextFunction) => void;
    listAdmins: (req: Request, res: Response, next: import("express").NextFunction) => void;
    listPendingDoctors: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const adminController: AdminController;
