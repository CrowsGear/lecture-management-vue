import type { ISearchParams } from "./common/searchParams";
import type { ILectureStudent } from "./lecture";
import type { ISchool } from "./school";
import type { IStudentParent } from "./parent";
import type { ITeacherExcelData } from "./teacher";


/* student Table */
export interface IStudent {
  id: number;
  schoolId: number;
  studentCode: string;
  studentName: string;
  studentPhone: string;
  studentGrade: number;
  isAttend: number;
  password: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  school?: ISchool;
  lectureStudents?: ILectureStudent[];
  studentParents?: IStudentParent[];
}

/* student excel data */
export interface IStudentExcelData {
  studentName: string;
  studentPhone: string;
  studentCode: string;
  studentGrade: number;
  isAttend: number;
  parents: {
    parentPhone: string;
  }[];
  school: {
    schoolName: string;
  };
}

/* lecture excel data */
export interface ILectureExcelData {
  lectureCode: string;
  title: string;
  description: string;
  lectureStartDate: string;
  lectureEndDate?: string;
  teacher: ITeacherExcelData;
  students: IStudentExcelData[];
}

export interface IExcelUploadData {
  lectures: ILectureExcelData[];
}

export interface IStudentForm {
  studentName: string;
  studentPhone: string;
  parentPhone: string;
  studentGrade?: number;
  isAttend?: number;
  schoolName: string;
  password?: string;
}

export interface IStudentSubmitData {
  student: {
    studentName: string;
    studentPhone: string;
  };
  parents: Array<{
    parentName: string;
    parentPhone: string;
    password: string;
  }>;
  school: {
    id: number;
    schoolName: string;
  };
  lectures: Array<{
    id: number;
  }>;
}

export interface IStudentSearchParams extends ISearchParams {
  studentName?: string;
  studentPhone?: string;
  schoolName?: string;
} 