import { z } from 'zod';
export declare const submitRatingSchema: z.ZodObject<{
    rating: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    rating?: number;
    comment?: string;
}, {
    rating?: number;
    comment?: string;
}>;
export declare const listRatingsQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit?: number;
    page?: number;
}, {
    limit?: number;
    page?: number;
}>;
