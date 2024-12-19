import axios from '../utils/axios';
import type { ITeacher } from '../types/teacher';

interface ITeacherResponse {
  data: ITeacher | ITeacher[];
  message?: string;
  success: boolean;
}

/**
 * 강사 목록 조회
 * @description 전체 강사 목록을 조회합니다.
 * @returns {Promise<ITeacherResponse>} 강사 목록 응답
 */
export const fetchTeachers = async (): Promise<ITeacherResponse> => {
  try {
    const response = await axios.get('/teachers');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch teachers:', error);
    throw error;
  }
};

/**
 * 강사 추가
 * @param teacherData - 추가할 강사 정보
 */
export const createTeacher = async (teacherData: Partial<ITeacher>): Promise<ITeacherResponse> => {
  try {
    const response = await axios.post('/teachers', teacherData);
    return response.data;
  } catch (error) {
    console.error('Failed to create teacher:', error);
    throw error;
  }
};

/**
 * 강사 정보 수정
 * @param id - 수정할 강사 ID
 * @param teacherData - 수정할 강사 정보
 */
export const updateTeacher = async (id: number, teacherData: Partial<ITeacher>): Promise<ITeacherResponse> => {
  try {
    const response = await axios.put(`/teachers/${id}`, teacherData);
    return response.data;
  } catch (error) {
    console.error('Failed to update teacher:', error);
    throw error;
  }
};

/**
 * 강사 삭제
 * @param id - 삭제할 강사 ID
 */
export const deleteTeacher = async (id: number): Promise<ITeacherResponse> => {
  try {
    const response = await axios.delete(`/teachers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete teacher:', error);
    throw error;
  }
}; 