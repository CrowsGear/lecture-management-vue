/* Third Party */
import axios from "../utils/axios";

/* Types */
import type { ISchoolSearchParams } from "../types/school.ts";
import type { IResponse } from "../types/common/response.ts";

/* 학교 목록 조회 */
export const fetchSchools = async (params: ISchoolSearchParams): Promise<IResponse> => {
    const response = await axios
        .get(
            '/schools',
            { params }
        );
    return response.data;
}

/* 학교 삭제 by id */
export const deleteSchool = async (id: number): Promise<IResponse> => {
  try {
    const response = await axios.delete(`/schools/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete school:', error);
    throw error;
  }
};
