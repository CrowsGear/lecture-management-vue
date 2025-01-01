import type { ILectureSession } from "./lecture";
import type { ISearchParams } from "./common/searchParams";
import { IStudent } from "./student";

export interface IGrade {
  id: number;
  gradeImageUrl: string;
  lectureSessionId: number;
  studentId: number;
  smsStatus: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  lectureSession?: ILectureSession;
  student?: IStudent;
}

export interface IGradeImage {
  file: File;
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
  params: IGradeUploadParams;
  errorMessage?: string;
  uploadStatus?: "success" | "error";
  uploadMessage?: string;
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
  lectureCode?: string;
}