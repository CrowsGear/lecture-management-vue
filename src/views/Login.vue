<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from "vue-router";
import type { ILoginForm } from '../types/login';

const PHONE_REGEX = /^\d{8}$/;
const PASSWORD_REGEX = /^\d{5}$/;

const router = useRouter();
const authStore = useAuthStore();

const form = ref<ILoginForm>({
  phone: '',
  password: ''
});

const errors = ref({
  phone: '',
  password: ''
});

// 전화번호 유효성 검사
const validatePhone = (value: string) => {
  if (!value) {
    errors.value.phone = '';
    return false;
  }
  if (!PHONE_REGEX.test(value)) {
    errors.value.phone = '휴대폰 번호 뒤 8자리를 입력해주세요.';
    return false;
  }
  errors.value.phone = '';
  return true;
};

// 비밀번호 유효성 검사
const validatePassword = (value: string) => {
  if (!value) {
    errors.value.password = '';
    return false;
  }
  if (!PASSWORD_REGEX.test(value)) {
    errors.value.password = '비밀번호는 5자리 숫자여야 합니다.';
    return false;
  }
  errors.value.password = '';
  return true;
};

const handleLogin = async (): Promise<void> => {
  // 최종 유효성 검사
  const isPhoneValid = validatePhone(form.value.phone);
  const isPasswordValid = validatePassword(form.value.password);
  
  if (!isPhoneValid || !isPasswordValid) return;

  try {
    // 010 추가하여 로그인 요청
    const loginData = {
      phone: `010${form.value.phone}`,
      password: form.value.password
    };

    await authStore.login(loginData);
    router.push('/');
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// CSS 변수 정의
const colors = {
  light: {
    '--text-color': '#000000',
    '--bg-color': '#ffffff',
    '--border-color': '#000000',
    '--error-color': '#ff0000',
    '--button-bg': '#000000',
    '--button-text': '#ffffff',
    '--button-disabled': '#666666',
    '--divider-color': '#000000'
  },
  dark: {
    '--text-color': '#ffffff',
    '--bg-color': '#1a1a1a',
    '--border-color': '#ffffff',
    '--error-color': '#ff6b6b',
    '--button-bg': '#ffffff',
    '--button-text': '#000000',
    '--button-disabled': '#999999',
    '--divider-color': '#ffffff'
  }
};

// 시스템 다크 모드 감지 및 CSS 변수 적용
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  Object.entries(colors.dark).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
} else {
  Object.entries(colors.light).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
}

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
            <div class="input-container">
              <label for="userId">ID</label>
              <input
                  type="text"
                  id="userId"
                  v-model="form.phone"
                  @input="validatePhone(form.phone)"
                  maxlength="8"
              />
            </div>
            <div class="error-message" v-if="errors.phone">
              {{ errors.phone }}
            </div>
          </div>

          <!-- PW 입력 -->
          <div class="input-row">
            <div class="input-container">
              <label for="password">P.W</label>
              <input
                  type="password"
                  id="password"
                  v-model="form.password"
                  @input="validatePassword(form.password)"
                  maxlength="5"
              />
            </div>
            <div class="error-message" v-if="errors.password">
              {{ errors.password }}
            </div>
          </div>
        </div>

        <!-- Enter 버튼 -->
        <button
            class="enter-btn"
            @click="handleLogin"
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
  max-width: 37.5rem;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.banner {
  width: 100%;
  margin: 1.25rem 0;
  min-height: 12.5rem;
}

.banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-divider {
  height: 0.125rem;
  background-color: var(--divider-color);
  margin: 1.875rem 0;
}

.login-form {
  padding: 0 1.25rem;
}

.form-content {
  display: flex;
  gap: 1rem;
}

.input-section {
  flex: 1;
}

.input-row {
  position: relative;
  display: flex;
  margin-bottom: 1rem;
}

.input-container {
  display: flex;
  width: 100%;
  align-items: center;
}

.input-row label {
  width: 2.8rem;
  font-size: 1rem;
  font-weight: bold;
  margin-right: 0.625rem;
}

input {
  flex: 1;
  height: 2.5rem;
  border: 1px solid var(--border-color);
  padding: 0 0.625rem;
  font-size: 1rem;
  outline: none;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.enter-btn {
  width: 7.5rem;
  height: 6.25rem;
  background: var(--button-bg);
  color: var(--button-text);
  border: none;
  font-size: 1rem;
  cursor: pointer;
  font-weight: normal;
  border-radius: 0.625rem;
  margin-top: -0.125rem;
}

.enter-btn:disabled {
  background: var(--button-disabled);
}

.login-help {
  margin-top: 1.875rem;
}

.help-section {
  margin-bottom: 1.25rem;
}

.help-section h3 {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: left;
  color: var(--text-color);
}

.help-section p {
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
  color: var(--text-color);
  text-align: left;
}

.error-message {
  position: absolute;
  bottom: -0.9375rem;
  left: 3.4375rem;
  color: var(--error-color);
  font-size: 0.625rem;
  line-height: 1;
}

/* 다크 모드 미디어 쿼리 */
@media (prefers-color-scheme: dark) {
  input::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
}
</style>
