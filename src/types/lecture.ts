import type { ISearchParams } from "./common/searchParams";
import type { IStudent } from "./student";
import type { ITeacher } from "./teacher";

export interface ILecture {
  id: number;
  teacherId: number;
  lectureCode: string;
  lectureStartDate: string;
  lectureEndDate: string;
  lectureIsShow: number;
  title: string;
  description: string;
  smsForm: string;
  teacher?: ITeacher;
  lectureSessions?: ILectureSession[];
  lectureStudents?: ILectureStudent[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface ILectureSession {
  id: number;
  sessionNo: string;
  sessionDate: string;
  description: string | null;
  lectureId: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  lecture?: ILecture;
}

export interface ILectureStudent {
  id: number;
  studentId: number;
  lectureId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  student?: IStudent;
  lecture?: ILecture;
}

export interface ILectureSearchParams extends ISearchParams {
  lectureCode?: string;
} 