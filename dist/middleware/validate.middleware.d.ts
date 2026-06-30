import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
type RequestPart = 'body' | 'query' | 'params';
export declare function validate(schema: ZodSchema, part?: RequestPart): (req: Request, _res: Response, next: NextFunction) => void;
export {};
