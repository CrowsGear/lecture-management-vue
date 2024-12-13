import axios from "axios";
import type { ISchoolSearchParams, ISchool } from "../types/school.ts";

const API_URL = "http://13.125.125.231:3030/api/v1";

export const fetchSchools = async (params: ISchoolSearchParams): Promise<any> => {
    const response = await axios
        .get<ISchool[]>(
            `${API_URL}/schools`,
            { params }
        );
    return response.data;
}
