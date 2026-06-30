import type { Request, Response } from 'express';
export declare class AppointmentsController {
    book: (req: Request, res: Response, next: import("express").NextFunction) => void;
    list: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getById: (req: Request, res: Response, next: import("express").NextFunction) => void;
    cancel: (req: Request, res: Response, next: import("express").NextFunction) => void;
    reschedule: (req: Request, res: Response, next: import("express").NextFunction) => void;
    accept: (req: Request, res: Response, next: import("express").NextFunction) => void;
    reject: (req: Request, res: Response, next: import("express").NextFunction) => void;
    doctorManualBook: (req: Request, res: Response, next: import("express").NextFunction) => void;
    markAttendance: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const appointmentsController: AppointmentsController;
