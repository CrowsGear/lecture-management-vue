<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const autoLogout = () => {
  authStore.logout();
};

onMounted(() => {
  autoLogout();
  router.push('/login');
});
</script>

<template>
  <div class="home-layout">
    <div class="home-container">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.home-layout {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.home-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  background-color: var(--bg-color);
  border-radius: 8px;
  overflow: hidden;
}

/* 모바일 환경 최적화 */
@media (max-width: 768px) {
  .home-layout {
    padding: 0;
    justify-content: flex-start;
  }

  .home-container {
    max-width: 100%;
    min-height: 100vh;
    border-radius: 0;
  }
}

/* 태블릿 환경 최적화 */
@media (min-width: 769px) and (max-width: 1024px) {
  .home-layout {
    padding: 40px 20px;
  }

  .home-container {
    max-width: 500px;
  }
}
</style>
