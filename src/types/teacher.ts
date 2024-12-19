export interface ITeacher {
  id: number;
  teacherName: string;
  teacherPhone: string;
  password: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface ITeacherSearchParams {
  teacherName?: string;
  period?: {
    start: string;
    end: string;
  };
} 