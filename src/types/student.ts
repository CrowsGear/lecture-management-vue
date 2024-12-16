export interface IParent {
  parentName: string;
  parentPhone: string;
  password: string;
}

export interface ISchool {
  schoolName: string;
}

export interface IStudent {
  studentName: string;
  studentPhone: string;
  studentCode: string;
  password: string;
  parents: IParent[];
  school: ISchool;
}

export interface ILecture {
  lectureCode: string;
  lectureStartDate: string;
  lectureEndDate: string;
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

export interface IStudentSearchParams {
  studentName?: string;
  schoolName?: string;
  period?: {
    start: string;
    end: string;
  };
} 