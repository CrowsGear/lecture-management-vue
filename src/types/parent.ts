import type { IStudent } from "./student";

export interface IParent {
  id: number;
  parentName: string;
  parentPhone: string;
  password: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IStudentParent {
  id: number;
  studentId: number;
  parentId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  student?: IStudent;
  parent?: IParent;
}
