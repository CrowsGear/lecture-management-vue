import { createRouter, createWebHistory } from "vue-router";
import adminRoutes from "./modules/admin";
import mainRoutes from "./modules/main";
import gradesRoutes from "./modules/grades";


const router = createRouter({
    history: createWebHistory(),
    routes: [
        ...mainRoutes,
        ...adminRoutes,
        ...gradesRoutes,
    ],
});

export default router;
