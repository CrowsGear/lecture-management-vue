import type { ISearchParams } from './common/searchParams';

export interface ISchool {
    id: number;
    schoolName: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    [key: string]: string | number | undefined;
}

export interface ISchoolSearchParams extends ISearchParams {
    schoolName?: string;
}
