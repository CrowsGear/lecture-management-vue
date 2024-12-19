import axios from '../utils/axios';
import type { ILecture } from '../types/lecture';

interface ILectureResponse {
  data: ILecture[];
  message?: string;
  success: boolean;
}

export const fetchLectures = async (): Promise<ILectureResponse> => {
  try {
    const response = await axios.get('/lectures');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch lectures:', error);
    throw error;
  }
};

export const createLecture = async (lectureData: Partial<ILecture>): Promise<ILectureResponse> => {
  try {
    const response = await axios.post('/lectures', lectureData);
    return response.data;
  } catch (error) {
    console.error('Failed to create lecture:', error);
    throw error;
  }
};

export const updateLecture = async (id: number, lectureData: Partial<ILecture>): Promise<ILectureResponse> => {
  try {
    const response = await axios.put(`/lectures/${id}`, lectureData);
    return response.data;
  } catch (error) {
    console.error('Failed to update lecture:', error);
    throw error;
  }
}; 