<script setup lang="ts">
import { reactive } from "vue";

const loginForm = reactive({
  id: "",
  password: "",
});

const login = () => {
  console.log(loginForm);
};

</script>

<template>
  <div class="login">
    <h1>학부모 로그인</h1>
    <div>
      <label for="id">아이디</label>
      <input type="text" id="id" v-model="loginForm.id" />
      <label for="password">비밀번호</label>
      <input type="password" id="password" v-model="loginForm.password" />
    </div>
    <div>
      <button @click="login">로그인</button>
    </div>
  </div>
</template>

<style scoped>

</style>
