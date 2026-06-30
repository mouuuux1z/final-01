import type { Request, Response } from 'express';
export declare class RatingsController {
    submit: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getMyRating: (req: Request, res: Response, next: import("express").NextFunction) => void;
    listByDoctor: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const ratingsController: RatingsController;
