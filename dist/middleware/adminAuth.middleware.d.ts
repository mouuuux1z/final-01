import type { NextFunction, Request, Response } from 'express';
export declare const adminAuthMiddleware: ((req: Request, _res: Response, next: NextFunction) => void)[];
export declare function adminOnly(req: Request, _res: Response, next: NextFunction): void;
