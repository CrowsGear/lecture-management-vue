import type { ISearchParams } from "./common/searchParams";

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
}

export interface ILectureSearchParams extends ISearchParams {
  lectureCode?: string;
} 