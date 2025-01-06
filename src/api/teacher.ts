import axiosInstance from "../utils/axios";
import type { ITeacher, ITeacherSearchParams } from "../types/teacher";
import type { IResponse } from "../types/common/response";

/**
 * 강사 목록 조회
 * @description 전체 강사 목록을 조회합니다.
 * @returns {Promise<IResponse>} 강사 목록 응답
 */
export const fetchTeachers = async (searchParams?: ITeacherSearchParams): Promise<IResponse> => {
  try {
    const response = await axiosInstance.get("/teachers", { params: searchParams });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch teachers:", error);
    throw error;
  }
};

/**
 * 강사 추가
 * @param teacherData - 추가할 강사 정보
 */
export const createTeacher = async (teacherData: Partial<ITeacher>): Promise<IResponse> => {
  try {
    const response = await axiosInstance.post("/teachers", teacherData);
    return response.data;
  } catch (error) {
    console.error("Failed to create teacher:", error);
    throw error;
  }
};

/**
 * 강사 정보 수정
 * @param id - 수정할 강사 ID
 * @param teacherData - 수정할 강사 정보
 */
export const updateTeacher = async (id: number, teacherData: Partial<ITeacher>): Promise<IResponse> => {
  try {
    const response = await axiosInstance.put(`/teachers/${id}`, teacherData);
    return response.data;
  } catch (error) {
    console.error("Failed to update teacher:", error);
    throw error;
  }
};

/**
 * 강사 삭제
 * @param id - 삭제할 강사 ID
 */
export const deleteTeacher = async (id: number): Promise<IResponse> => {
  try {
    const response = await axiosInstance.delete(`/teachers/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete teacher:", error);
    throw error;
  }
}; 