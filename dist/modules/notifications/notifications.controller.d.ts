import type { Request, Response } from 'express';
export declare class NotificationsController {
    list: (req: Request, res: Response, next: import("express").NextFunction) => void;
    markAsRead: (req: Request, res: Response, next: import("express").NextFunction) => void;
    markAllAsRead: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const notificationsController: NotificationsController;
