export interface ISearchParams {
    period?: {
        start: string;
        end: string;
    },
    page?: number;
    limit?: number;
}