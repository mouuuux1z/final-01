import type { Request, Response } from 'express';
export declare class PatientsController {
    getMe: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateMe: (req: Request, res: Response, next: import("express").NextFunction) => void;
    adminList: (req: Request, res: Response, next: import("express").NextFunction) => void;
    adminGet: (req: Request, res: Response, next: import("express").NextFunction) => void;
    adminUpdateStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const patientsController: PatientsController;
