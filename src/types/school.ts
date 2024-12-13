export interface ISchool {
    id: number;
    schoolName: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    [key: string]: string | number | undefined;
}

export interface ISchoolSearchParams {
    schoolName: string;
    period: {
        start: string;
        end: string;
    }
}
