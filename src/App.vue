<template>
  <main>
    <Login />
    <RouterView />
  </main>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  /* 기본 색상 */
  --text-color: #000000;
  --bg-color: #ffffff;
  --border-color: #e0e0e0;
  --error-color: #ff0000;
  --button-bg: #000000;
  --button-text: #ffffff;
  --button-disabled: #666666;
  --divider-color: #e0e0e0;
  --bg-hover: #f5f5f5;
  --bg-secondary: #fafafa;
  --text-secondary: #666666;
  --table-header-bg: #f5f5f5;
  --table-stripe-bg: #fafafa;
}
</style>
