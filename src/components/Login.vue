<script setup lang="ts">
import { reactive } from "vue";

const loginForm = reactive({
  id: "",
  password: "",
});

const login = () => {
  console.log(loginForm);
};

const test = () => {
  fetch("http://13.125.125.231:3030/api/v1/schools")
    .then((res) => res.json())
    .then((res) => console.log(res));
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
      <button @click="test">API 요청 TEST</button>
    </div>
  </div>
</template>

<style scoped>

</style>
