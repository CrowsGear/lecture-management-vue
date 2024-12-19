export interface ILecture {
  id: number;
  lectureCode: string;
  lectureStartDate: string;
  lectureEndDate: string;
  teacherId: number;
  lectureIsShow: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ILectureSearchParams {
  lectureCode?: string;
  period?: {
    start: string;
    end: string;
  };
} 