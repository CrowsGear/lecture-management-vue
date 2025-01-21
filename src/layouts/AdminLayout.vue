<script setup lang="ts">
import { onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

/* Methods */
const handleLogout = () => {
  authStore.logout();
  router.push("/");
};

onMounted(() => {
  if (!authStore.isAuthenticated) {
    alert("로그인 후 이용해주세요.");
    router.push("/");
    return;
  }
  if (authStore.authType !== "0") {
    alert("관리자 권한이 필요합니다.");
    router.push("/");
    return;
  }

  /* TODO: 관리자 권한 검증 로직 추가 
  * 2차적으로 한 번 더 API 호출을 통해 관리자 권한 검증 로직 추가 필요
  */
});
</script>

<template>
  <div class="admin-layout">
    <!-- Admin Sidebar -->
    <nav class="admin-sidebar">
      <div class="logo-container">
        <img src="../assets/vue.svg" alt="logo" class="logo"/>
      </div>

      <ul class="menu-list">
        <li>
          <RouterLink to="/admin/schools" class="menu-item" active-class="active">
            학교 관리
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/admin/lectures" class="menu-item" active-class="active">
            강의 관리
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/admin/students" class="menu-item" active-class="active">
            학생 관리
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/admin/grades" class="menu-item" active-class="active">
            성적 관리
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/admin/banners" class="menu-item" active-class="active">
            배너 관리
          </RouterLink>
        </li>
      </ul>
    </nav>

    <!-- Admin Content -->
    <div class="admin-content-wrapper">
      <!-- Top Bar -->
      <div class="admin-top-bar">
        <div class="top-bar-left">
          관리자 페이지
        </div>
        <div class="top-bar-right">
          <button class="logout-button" @click="handleLogout">
            로그아웃
          </button>
        </div>
      </div>

      <main class="admin-content">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  width: 100%;
  min-height: 100vh;
  background-color: var(--content-bg);
}

.admin-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 900px;
  margin-left: 240px; /* 사이드바 너비만큼 여백 */
}

.admin-top-bar {
  height: 60px;
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  position: fixed;
  top: 0;
  right: 0;
  left: 240px; /* 사이드바 너비만큼 여백 */
  z-index: 100;
}

.top-bar-left {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-color);
}

.logout-button {
  padding: 8px 16px;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.logout-button:hover {
  background-color: #dc2626;
}

.admin-sidebar {
  width: 240px;
  background-color: var(--sidebar-bg);
  color: var(--sidebar-text);
  padding: 20px 0;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
  overflow-y: auto;
}

.logo-container {
  padding: 0 20px;
  margin-bottom: 30px;
}

.logo {
  max-width: 150px;
  height: auto;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  display: block;
  padding: 15px 20px;
  color: var(--sidebar-text);
  text-decoration: none;
  transition: background-color 0.3s;
}

.menu-item:hover {
  background-color: var(--sidebar-hover);
}

.menu-item.active {
  background-color: var(--sidebar-active);
  font-weight: bold;
}

.admin-content {
  flex: 1;
  padding: 80px 20px 20px; /* 상단바 높이 + 기존 패딩 */
  background-color: var(--content-bg);
  color: var(--text-color);
  width: calc(100% - 240px);
  min-width: 900px;
  box-sizing: border-box;
  overflow-x: auto;
}
</style>
