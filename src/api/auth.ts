import axios from "axios";
import type { ILoginForm } from "../types/login.ts";

const API_URL = "http://13.125.125.231:3030/api/v1";

export const login = async (pararms: ILoginForm): Promise<any> => {
    const response = await axios
        .post(
            `${API_URL}/auths/login`,
            pararms
        );
    return response.data;
}
