import { createRouter, createWebHistory } from 'vue-router';
import adminRoutes from "./modules/admin";
import mainRoutes from "./modules/main";


const router = createRouter({
    history: createWebHistory(),
    routes: [
        ...mainRoutes,
        ...adminRoutes,
    ],
})

export default router;
