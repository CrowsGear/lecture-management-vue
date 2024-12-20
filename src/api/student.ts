import axios from '../utils/axios';
import type { IStudentUploadData, IStudentSearchParams } from '../types/student';
import type { IResponse } from '../types/common/response';

export const fetchStudents = async (searchParams?: IStudentSearchParams): Promise<IResponse> => {
  try {
    const response = await axios.get('/students', { params: searchParams });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch students:', error);
    throw error;
  }
};

export const createStudent = async (studentData: any): Promise<IResponse> => {
  try {
    const response = await axios.post('/students', studentData);
    return response.data;
  } catch (error) {
    console.error('Failed to create student:', error);
    throw error;
  }
};

export const updateStudent = async (id: string, studentData: any): Promise<IResponse> => {
  try {
    const response = await axios.put(`/students/${id}`, studentData);
    return response.data;
  } catch (error) {
    console.error('Failed to update student:', error);
    throw error;
  }
};

export const deleteStudent = async (id: string): Promise<IResponse> => {
  try {
    const response = await axios.delete(`/students/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete student:', error);
    throw error;
  }
}; 

export const uploadStudents = async (studentData: IStudentUploadData): Promise<IResponse> => {
  try {
    const response = await axios.post('/common/uploads', studentData);
    return response.data;
  } catch (error) {
    console.error('Failed to upload students:', error);
    throw error;
  }
};