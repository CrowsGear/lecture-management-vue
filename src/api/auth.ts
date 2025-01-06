import axiosInstance from "../utils/axios";
import type { ILoginForm, ILoginResponse } from "../types/login.ts";

export const login = async (pararms: ILoginForm): Promise<any> => {
    const response = await axiosInstance
        .post(
            "/auths/login",
            pararms
        );

    return response.data as ILoginResponse;
};
