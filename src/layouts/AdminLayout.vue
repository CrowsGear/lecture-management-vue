<script setup lang="ts">
</script>

<template>
  <div class="admin-layout">

    <!-- Admin Sidebar -->
    <nav class="admin-sidebar">
      <div class="logo-container">
        <img src="../assets/vue.svg" alt="logo" class="logo"/>
      </div>
      <ul class = "menu-list">
        <li>
          <RouterLink to="/admin/schools" class="menu-item" active-class="active">
            학교 관리
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
      </ul>
    </nav>

    <!-- Admin Content -->
    <main class="admin-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-sidebar {
  width: 240px;
  background-color: #2c3e50;
  color: white;
  padding: 20px 0;
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
  color: #ffffff;
  text-decoration: none;
  transition: background-color 0.3s;
}

.menu-item:hover {
  background-color: #34495e;
}

.menu-item.active {
  background-color: #3498db;
  font-weight: bold;
}

.admin-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
}
</style>
