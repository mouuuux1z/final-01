import type { NextFunction, Request, Response } from 'express';
export declare function requireActiveClinic(req: Request, _res: Response, next: NextFunction): Promise<void>;
