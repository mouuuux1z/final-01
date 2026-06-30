export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export declare function parsePagination(query: {
    page?: unknown;
    limit?: unknown;
}): PaginationParams;
export declare function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta;
