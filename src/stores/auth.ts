import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from '../utils/axios';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const isAuthenticated = ref<boolean>(!!token.value);

  // 토큰 설정
  const setToken = (newToken: string) => {
    token.value = newToken;
    isAuthenticated.value = true;
    localStorage.setItem('token', newToken);
  };

  // 로그인
  const login = async (credentials: { phone: string; password: string }) => {
    try {
      const response = await axios.post('/auths/login', credentials);
      const { token: newToken } = response.data;
      setToken(newToken);
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // 로그아웃
  const logout = () => {
    token.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('token');
  };

  return {
    token,
    isAuthenticated,
    login,
    logout,
    setToken
  };
}); 