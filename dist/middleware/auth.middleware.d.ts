import type { NextFunction, Request, Response } from 'express';
import { UserType } from '@prisma/client';
export declare function authMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void>;
export declare function requireUserTypes(...allowedTypes: UserType[]): (req: Request, _res: Response, next: NextFunction) => void;
