import type { ILectureSession } from './lecture';
import type { ISearchParams } from './common/searchParams';

export interface IGradeImage {
  fileName: string;
  rawDateTime: string;
  gradeImageUrl: string;
  studentCode: string;
  examDateTime: string;
  lectureCode: string;
}

export interface IPreSignedUrl {
  signedUrl: string;
}

export interface IGradePreview extends IGradeImage {
  previewUrl: string;
}

export interface IGradeUploadParams {
  lecture: {
    lectureCode: string;
    student: {
      studentCode: string;
      grade: {
        gradeImageUrl: string;
      };
    };
    lectureSession: {
      sessionDate: string;
    };
  };
}

export interface IGradeSearchParams extends ISearchParams {
  studentName?: string;
  schoolName?: string;
}

export interface IGradeResponse {
  id: number;
  gradeImageUrl: string;
  lectureSessionId: number;
  studentId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  lectureSession: ILectureSession;
}