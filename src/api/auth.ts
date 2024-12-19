import axios from "../utils/axios";
import type { ILoginForm, ILoginResponse } from "../types/login.ts";

export const login = async (pararms: ILoginForm): Promise<any> => {
    const response = await axios
        .post(
            `/auths/login`,
            pararms
        );

    return response.data as ILoginResponse;
}
