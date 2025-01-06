import axiosInstance from "../utils/axios";
import type { IResponse } from "../types/common/response";

export const fetchSmsFormPlaceholders = async (): Promise<IResponse> => {
  const response = await axiosInstance.get("/constants", {
    params: { type: "sms-form-placeholder" }
  });
  return response.data;
};
