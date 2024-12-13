// import { configDotenv } from "dotenv";
// configDotenv();

import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

createApp(App)
    /* router 추가 */
    .use(router)

    /* mount */
    .mount('#app')
