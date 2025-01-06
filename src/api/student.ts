import axiosInstance from "../utils/axios";
import type { IExcelUploadData, IStudentSearchParams } from "../types/student";
import type { IResponse } from "../types/common/response";

export const fetchStudents = async (searchParams?: IStudentSearchParams): Promise<IResponse> => {
  try {
    const response = await axiosInstance.get("/students", { params: searchParams });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch students:", error);
    throw error;
  }
};

export const createStudent = async (studentData: any): Promise<IResponse> => {
  try {
    const response = await axiosInstance.post("/students", studentData);
    return response.data;
  } catch (error) {
    console.error("Failed to create student:", error);
    throw error;
  }
};

export const updateStudent = async (id: string, studentData: any): Promise<IResponse> => {
  try {
    const response = await axiosInstance.patch(`/students/${id}`, studentData);
    return response.data;
  } catch (error) {
    console.error("Failed to update student:", error);
    throw error;
  }
};

export const deleteStudent = async (id: string): Promise<IResponse> => {
  try {
    const response = await axiosInstance.delete(`/students/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete student:", error);
    throw error;
  }
}; 

export const uploadStudents = async (studentData: IExcelUploadData): Promise<IResponse> => {
  try {
    const response = await axiosInstance.post("/common/uploads", studentData);
    return response.data;
  } catch (error) {
    console.error("Failed to upload students:", error);
    throw error;
  }
};