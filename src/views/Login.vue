<script setup lang="ts" name="UserLogin">
/* Third Party */
import { ref } from "vue";

/* stores */
import { useAuthStore } from "../stores/auth";

/* types */
import type { ILoginForm } from "../types/login";

/* constants */
const PHONE_REGEX = /^\d{8}$/;
const PASSWORD_REGEX = /^\d{5}$/;

/* Stores */
const authStore = useAuthStore();

/* REFs */
const form = ref<ILoginForm>({
  phone: "",
  password: ""
});
const phoneMiddle = ref("");
const phoneLast = ref("");
const bannerTop = ref<string>(import.meta.env.VITE_BANNER_TOP_URL);
const bannerBottom = ref<string>(import.meta.env.VITE_BANNER_BOTTOM_URL);
const errors = ref({
  phone: "",
  password: ""
});

/**
 * Enter 키 입력 핸들러
 * @param event - 키보드 이벤트
 */
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    handleLogin();
  }
};

/**
 * 전화번호 유효성 검사
 * @param value - 전화번호
 * @returns - 유효성 검사 결과
 */
const validatePhone = (value: string) => {
  if (!value) {
    errors.value.phone = "";
    return false;
  }
  if (!PHONE_REGEX.test(value)) {
    errors.value.phone = "휴대폰 번호 뒤 8자리를 입력해주세요.";
    return false;
  }
  errors.value.phone = "";
  return true;
};

/**
 * 비밀번호 유효성 검사
 * @param value - 비밀번호
 * @returns - 유효성 검사 결과
 */
const validatePassword = (value: string) => {
  if (!value) {
    errors.value.password = "";
    return false;
  }
  if (!PASSWORD_REGEX.test(value)) {
    errors.value.password = "비밀번호는 5자리 숫자여야 합니다.";
    return false;
  }
  errors.value.password = "";
  return true;
};

/**
 * 전화번호 입력 핸들러 - 중간 자리
 */
const handleMiddleInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const value = input.value.replace(/\D/g, "").slice(0, 4);
  phoneMiddle.value = value;
  form.value.phone = phoneMiddle.value + phoneLast.value;
  validatePhone(form.value.phone);
  
  // 4자리 입력 완료시 다음 입력란으로 포커스 이동
  if (value.length === 4) {
    const nextInput = document.getElementById("phone-last");
    nextInput?.focus();
  }
};

/**
 * 전화번호 입력 핸들러 - 끝자리
 */
const handleLastInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const value = input.value.replace(/\D/g, "").slice(0, 4);
  phoneLast.value = value;
  form.value.phone = phoneMiddle.value + phoneLast.value;
  validatePhone(form.value.phone);
};

/**
 * 로그인 핸들러
 */
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

  } catch (error) {
    console.error("Login failed:", error);
  }
};

</script>

<template>
  <div class="login-container">
    <!-- 상단 배너 이미지 -->
    <div v-if="bannerTop" class="banner banner-top">
      <img :src="bannerTop" alt="상단 배너" />
    </div>

    <!-- 로그인 폼 -->
    <div class="login-form">
      <div class="form-divider"></div>

      <div class="form-content">
        <div class="input-section">
          <!-- ID 입력 -->
          <div class="input-row">
            <div class="input-container">
              <label for="phone-middle">ID</label>
              <div class="phone-input-group">
                <span class="phone-prefix">010</span>
                <span class="phone-separator">-</span>
                <input
                  type="text"
                  id="phone-middle"
                  v-model="phoneMiddle"
                  @input="handleMiddleInput"
                  @keypress="handleKeyPress"
                  maxlength="4"
                  placeholder="XXXX"
                />
                <span class="phone-separator">-</span>
                <input
                  type="text"
                  id="phone-last"
                  v-model="phoneLast"
                  @input="handleLastInput"
                  @keypress="handleKeyPress"
                  maxlength="4"
                  placeholder="XXXX"
                />
              </div>
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
                  @keypress="handleKeyPress"
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
          <p>ID는 현재 수강중인 학생(또는 학부모)의 휴대폰 번호 뒤 8자리 입니다. 예를 들어 본인 휴대폰 번호가 010-1234-5678라면 ID는 12345678입니다.</p>
        </div>

        <div class="help-section">
          <h3>(2) 패스워드는?</h3>
          <p>P.W는 문자로 전송된 고유 비밀번호를 입력하세요.</p>
        </div>
      </div>
    </div>

    <!-- 하단 배너 이미지 -->
    <div v-if="bannerBottom" class="banner banner-bottom">
      <img :src="bannerBottom" alt="" />
    </div>
  </div>
</template>



<style scoped>
.login-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.banner {
  width: 100%;
  height: auto;
  flex-shrink: 0;
}

.banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.form-divider {
  height: 0.125rem;
  background-color: var(--divider-color);
  margin: 1rem 0;
}

.login-form {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-content {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}

.input-section {
  flex: 1;
}

.input-row {
  position: relative;
  display: flex;
  margin-bottom: 1.5rem;
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
  align-self: flex-start;
}

.enter-btn:disabled {
  background: var(--button-disabled);
}

.login-help {
  margin-top: auto;
  padding-top: 1rem;
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
  bottom: -1.25rem;
  left: 3.4375rem;
  color: #1e3a8a;
  font-size: 0.75rem;
  line-height: 1.2;
}

.phone-input-group {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.phone-prefix {
  font-size: 1rem;
  color: var(--text-color);
  padding: 0 0.25rem;
}

.phone-separator {
  font-size: 1rem;
  color: var(--text-color);
  padding: 0 0.25rem;
}

.phone-input-group input {
  width: 4rem;
  height: 2.5rem;
  border: 1px solid var(--border-color);
  padding: 0 0.625rem;
  font-size: 1rem;
  outline: none;
  background-color: var(--bg-color);
  color: var(--text-color);
  text-align: center;
}

/* 모바일 환경 최적화 */
@media (max-width: 768px) {
  .banner {
    height: auto;
  }

  .login-form {
    padding: 0.75rem;
  }

  .form-content {
    margin: 0.75rem 0;
  }

  .enter-btn {
    width: 5rem;
    height: 5.8rem;
    font-size: 0.9rem;
  }

  .input-row label {
    width: 2.5rem;
    font-size: 0.9rem;
  }

  input {
    height: 2.2rem;
    font-size: 0.9rem;
  }

  .help-section {
    margin-bottom: 1rem;
  }

  .help-section h3,
  .help-section p {
    font-size: 0.9rem;
  }

  .phone-input-group input {
    width: 3.5rem;
    height: 2.2rem;
    font-size: 0.9rem;
  }
  
  .phone-prefix,
  .phone-separator {
    font-size: 0.9rem;
  }

  .input-row {
    margin-bottom: 1.25rem;
  }

  .error-message {
    font-size: 0.7rem;
  }
}

/* 태블릿 환경 최적화 */
@media (min-width: 769px) and (max-width: 1024px) {
  .login-form {
    padding: 1rem;
  }
}
</style>
