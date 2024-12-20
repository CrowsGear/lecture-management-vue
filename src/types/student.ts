import type { ISearchParams } from './common/searchParams';

export interface IParent {
  parentPhone: string;
}

export interface ISchool {
  schoolName: string;
}

export interface IStudent {
  studentName: string;
  studentPhone: string;
  studentCode: string;
  studentGrade: number;
  isAttend: number;
  parents: IParent[];
  school: ISchool;
}

export interface ILecture {
  lectureCode: string;
  lectureStartDate: string;
  lectureEndDate?: string;
  students: IStudent[];
}

export interface IStudentUploadData {
  lectures: ILecture[];
}

export interface IStudentForm {
  studentName: string;
  studentCode: string;
  studentPhone: string;
  parentName: string;
  parentPhone: string;
  schoolName: string;
  password?: string;
}

export interface IStudentSearchParams extends ISearchParams {
  studentName?: string;
  schoolName?: string;
} 