export interface ILecture {
  id: number;
  teacherId: number;
  lectureCode: string;
  lectureStartDate: string;
  lectureEndDate: string;
  lectureIsShow: number;
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

export interface ILectureSearchParams {
  lectureCode?: string;
  period?: {
    start: string;
    end: string;
  };
} 