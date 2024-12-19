import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from '../utils/axios';

const TOKEN_NAME = 'lmtk';
const AUTH_TYPE_NAME = 'lmtk_a_t';


export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_NAME));
  const authType = ref<string | null>(localStorage.getItem(AUTH_TYPE_NAME));
  const isAuthenticated = ref<boolean>(!!token.value);
  
  /* 토큰 설정 */
  const setToken = (newToken: string) => {
    token.value = newToken;
    isAuthenticated.value = true;
    localStorage.setItem(TOKEN_NAME, newToken);
  };

  const setAuthType = (newAuthType: number) => {
    authType.value = newAuthType.toString();
    localStorage.setItem(AUTH_TYPE_NAME, newAuthType.toString());
  }

  /* 로그인 */
  const login = async (credentials: { phone: string; password: string }) => {
    try {
      const response = await axios.post('/auths/login', credentials);
      const { authType: newAuthType, accessToken: newToken } = response.data.data;

      setAuthType(newAuthType);
      setToken(newToken);

      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  /* 로그아웃 */
  const logout = () => {
    token.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem(TOKEN_NAME);
    localStorage.removeItem(AUTH_TYPE_NAME);
  };

  return {
    token,
    isAuthenticated,
    login,
    logout,
    setToken
  };
}); 