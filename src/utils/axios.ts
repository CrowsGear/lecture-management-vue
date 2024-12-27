import axios from "axios";
import router from "../router";

const API_KEY = import.meta.env.VITE_API_KEY || "";
const API_KEY_HEADER = "x-api-key";
const tokenName = "lmtk";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // API 키 추가
    config.headers[API_KEY_HEADER] = API_KEY;

    // 토큰이 있으면 Authorization 헤더 추가
    const token = localStorage.getItem(tokenName);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.data?.code === "AU-403") {
      alert(error.response.data.message);
      localStorage.removeItem(tokenName);
      router.push("/login");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;