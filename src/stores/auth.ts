import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "../utils/axios";
import { useRouter } from "vue-router";
import { AxiosError } from "axios";

const TOKEN_NAME = "lmtk";
const AUTH_TYPE_NAME = "lmtk_a_t";
const AUTH_TYPES = [0,1,2];


export const useAuthStore = defineStore("auth", () => {
  const router = useRouter();
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
  };

  /* 로그인 */
  const login = async (credentials: { phone: string; password: string }) => {
    try {
      const response = await axios.post("/auths/login", credentials);
      const { authType: newAuthType, accessToken: newToken } = response.data.data;

      /* 로그인 실패 */
      if (!AUTH_TYPES.includes(newAuthType) || !newToken) {
        throw new Error(response.data.message);
      }

      /* 강사: 관리자 페이지 이동 */
      if (newAuthType === 0) {
        console.log("should go to admin page");
        router.push("/admin");
      }

      /* 학생: 메인 페이지 이동 */
      if (newAuthType === 1) {
        console.log("should go to student page");
        router.push("/grades");
      }

      /* 학부모: 메인 페이지 이동 */
      if (newAuthType === 2) {
        console.log("should go to parent page");
        router.push("/grades");
      }

      /* 로그인 성공 */
      setAuthType(newAuthType);
      setToken(newToken);

      return response.data;
    } catch (error) {
      if (
        error instanceof AxiosError && 
        error.response?.status === 404
      ) {
        alert(error.response.data?.message);
        return;
      }
      alert(`로그인 실패: ${(error as Error).message}`);
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
    authType,
    isAuthenticated,
    login,
    logout,
    setToken
  };
}); 