import type { Request, Response } from 'express';
export declare class DoctorsController {
    search: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getMe: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateMe: (req: Request, res: Response, next: import("express").NextFunction) => void;
    setOnlineStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getSchedules: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createSchedule: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateSchedule: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteSchedule: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getAvailability: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createAvailabilitySlot: (req: Request, res: Response, next: import("express").NextFunction) => void;
    bulkCreateAvailability: (req: Request, res: Response, next: import("express").NextFunction) => void;
    generateAvailability: (req: Request, res: Response, next: import("express").NextFunction) => void;
    generateRecurringAvailability: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getMyAvailability: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteAvailabilitySlot: (req: Request, res: Response, next: import("express").NextFunction) => void;
    adminList: (req: Request, res: Response, next: import("express").NextFunction) => void;
    adminUpdate: (req: Request, res: Response, next: import("express").NextFunction) => void;
    adminDelete: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const doctorsController: DoctorsController;
