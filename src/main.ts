import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css'
import App from './App.vue'
import router from './router'
import { initTheme } from './styles/theme';

const pinia = createPinia()
const app = createApp(App)

// 테마 초기화
initTheme();

app
    /* router 추가 */
    .use(router)

    /* pinia 추가(state 관리) */
    .use(pinia)

    /* mount */
    .mount('#app')
