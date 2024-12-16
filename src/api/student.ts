import axios from '../utils/axios';
import type { IStudent } from '../types/student';

interface IStudentResponse {
  data: IStudent[];
  message?: string;
  success: boolean;
}

export const fetchStudents = async (): Promise<IStudentResponse> => {
  try {
    const response = await axios.get('/students');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch students:', error);
    throw error;
  }
};

export const createStudent = async (studentData: any): Promise<IStudentResponse> => {
  try {
    const response = await axios.post('/students', studentData);
    return response.data;
  } catch (error) {
    console.error('Failed to create student:', error);
    throw error;
  }
};

export const updateStudent = async (id: string, studentData: any): Promise<IStudentResponse> => {
  try {
    const response = await axios.put(`/students/${id}`, studentData);
    return response.data;
  } catch (error) {
    console.error('Failed to update student:', error);
    throw error;
  }
};

export const deleteStudent = async (id: string): Promise<IStudentResponse> => {
  try {
    const response = await axios.delete(`/students/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete student:', error);
    throw error;
  }
}; 