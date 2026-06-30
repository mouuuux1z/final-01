import type { NextFunction, Request, Response } from 'express';
export declare function requireActiveDoctor(req: Request, _res: Response, next: NextFunction): Promise<void>;
