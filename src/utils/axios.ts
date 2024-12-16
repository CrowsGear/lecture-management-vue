import axios from 'axios';

const API_KEY = import.meta.env.VITE_API_KEY || '';
const API_KEY_HEADER = 'x-api-key';
const tokenName = 'lmtk';

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
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance; 