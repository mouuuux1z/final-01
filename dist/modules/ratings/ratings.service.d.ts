export declare class RatingsService {
    submit(patientId: string, doctorId: string, data: {
        rating: number;
        comment?: string;
    }): Promise<{
        rating: {
            id: string;
            createdAt: Date;
            rating: number;
            doctorId: string;
            patientId: string;
            comment: string | null;
        };
        aggregate: {
            rating: number;
            ratingCount: number;
        };
    }>;
    getMyRating(patientId: string, doctorId: string): Promise<{
        rating: {
            id: string;
            createdAt: Date;
            rating: number;
            doctorId: string;
            patientId: string;
            comment: string | null;
        };
        eligible: boolean;
    }>;
    listByDoctor(doctorId: string, query: Record<string, unknown>): Promise<{
        items: {
            id: string;
            rating: number;
            comment: string;
            createdAt: Date;
            patientName: string;
        }[];
        meta: import("../../utils/pagination.js").PaginationMeta;
    }>;
}
export declare const ratingsService: RatingsService;
