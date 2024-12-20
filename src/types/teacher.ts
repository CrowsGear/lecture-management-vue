import type { ISearchParams } from './common/searchParams';

export interface ITeacher {
  id: number;
  teacherName: string;
  teacherPhone: string;
  password: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface ITeacherSearchParams extends ISearchParams {
  teacherName?: string;
} 