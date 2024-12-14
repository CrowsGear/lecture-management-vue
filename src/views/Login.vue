<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from "vue-router";
import type { ILoginForm } from '../types/login';
import { login } from '../api/auth';

const router = useRouter();
const isLoading = ref<boolean>(false);
const PHONE_REGEX = /^\d{8}$/;

/* 폼 데이터 */
const form = reactive<ILoginForm>({
  phone: '',
  password: ''
});

/* 에러 메시지 */
const errors = reactive({
  phone: '',
  password: ''
});

/* 폼 유효성 검사 */
const validateForm = (): boolean => {
  let isValid = true;
  errors.phone = '';
  errors.password = '';

  if (!form.phone) {
    errors.phone = 'ID를 입력해주세요.';
    isValid = false;
  } else if (!PHONE_REGEX.test(form.phone)) {
    errors.phone = '휴대폰 번호 뒤 8자리를 입력해주세요.';
    isValid = false;
  }

  if (!form.password) {
    errors.password = '비밀번호를 입력해주세요.';
    isValid = false;
  }

  return isValid;
};

const handleLogin = async (): Promise<void> => {
  if (!validateForm()) return;

  try {
    isLoading.value = true;

    // 실제 API 호출 로직으로 대체 필요
    const response = await login(form);

    if (response.success) {
      // 토큰 저장
      localStorage.setItem('token', response.token || '');
      // 홈 페이지로 리다이렉트
      router.push('/');
    } else {
      alert(response.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <!-- 상단 배너 이미지 -->
    <div class="banner banner-top">
      <img src="../assets/jmmath_banner_example.png" alt="상단 배너" />
    </div>

    <!-- 로그인 폼 -->
    <div class="login-form">
      <div class="form-divider"></div>

      <div class="form-content">
        <div class="input-section">
          <!-- ID 입력 -->
          <div class="input-row">
            <label for="userId">ID</label>
            <input
                type="text"
                id="userId"
                v-model="form.phone"
            />
          </div>

          <!-- PW 입력 -->
          <div class="input-row">
            <label for="password">P.W</label>
            <input
                type="password"
                id="password"
                v-model="form.password"
            />
          </div>
        </div>

        <!-- Enter 버튼 -->
        <button
            class="enter-btn"
            @click="handleLogin"
            :disabled="isLoading"
        >
          Enter
        </button>
      </div>

      <div class="form-divider"></div>

      <!-- 로그인 도움말 -->
      <div class="login-help">
        <div class="help-section">
          <h3>(1) 아이디는?</h3>
          <p>ID는 현재 수강중인 학생(또는 학부모)의 휴대폰 번호 뒤 8자리 입니다. 예를 들어 본인 휴대폰 번호가 010-1234-1234라면 ID는 12341234입니다.</p>
        </div>

        <div class="help-section">
          <h3>(2) 패스워드는?</h3>
          <p>P.W는 문자로 전송된 고유 비밀번호를 입력하세요.</p>
        </div>
      </div>
    </div>

    <!-- 하단 배너 이미지 -->
    <div class="banner banner-bottom">
      <img src="../assets/jmmath_banner_example.png" alt="하단 배너" />
    </div>
  </div>
</template>



<style scoped>
.login-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.banner {
  width: 100%;
  margin: 20px 0;
  min-height: 200px;
}

.banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-divider {
  height: 2px;
  background-color: #000;
  margin: 30px 0;
}

.login-form {
  padding: 0 20px;
}

.form-content {
  display: flex;
  gap: 15px;
}

.input-section {
  flex: 1;
}

.input-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.input-row:last-child {
  margin-bottom: 0;
}

.input-row label {
  width: 45px;
  font-size: 16px;
  font-weight: bold;
  margin-right: 10px;
}

input {
  flex: 1;
  height: 40px;
  border: 1px solid #000;
  padding: 0 10px;
  font-size: 16px;
  outline: none;
}

.enter-btn {
  width: 120px;
  height: 95px; /* ID와 PW 입력창 높이 + 간격 */
  background: #000;
  color: #fff;
  border: none;
  font-size: 16px;
  cursor: pointer;
  font-weight: normal;
}

.enter-btn:disabled {
  background: #666;
}

.login-help {
  margin-top: 30px;
}

.help-section {
  margin-bottom: 20px;
}

.help-section h3 {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  text-align: left;
}

.help-section p {
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
  color: #000;
  text-align: left;
}
</style>
