import type { Request, Response } from 'express';
export declare class AuthController {
    register: (req: Request, res: Response, next: import("express").NextFunction) => void;
    registerDoctor: (req: Request, res: Response, next: import("express").NextFunction) => void;
    registerClinic: (req: Request, res: Response, next: import("express").NextFunction) => void;
    login: (req: Request, res: Response, next: import("express").NextFunction) => void;
    logout: (req: Request, res: Response, next: import("express").NextFunction) => void;
    me: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const authController: AuthController;
