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

export interface IParsedGradeImageName {
  fileName: string;
  rawDateTime: string;
  examDateTime: string;
  lectureCode: string;
  studentCode: string;
}

export interface IPreSignedUrl {
  signedUrl: string;
}

export interface IParsedGrade extends IParsedGradeImageName {
  file: File;
  previewUrl: string;
  params: IGradeUploadParams;
  errorMessage?: string;
  uploadStatus?: "success" | "error";
  uploadMessage?: string;
  smsForm?: string;
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
  smsForm: string;
}

export interface IGradeSearchParams extends ISearchParams {
  studentName?: string;
  lectureCode?: string;
}