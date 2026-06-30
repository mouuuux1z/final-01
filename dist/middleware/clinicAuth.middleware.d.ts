import type { NextFunction, Request, Response } from 'express';
export declare const clinicAuthMiddleware: ((req: Request, _res: Response, next: NextFunction) => void)[];
export declare function clinicOnly(req: Request, _res: Response, next: NextFunction): void;
