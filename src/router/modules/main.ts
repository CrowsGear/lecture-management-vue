import { RouteRecordRaw } from 'vue-router';
import Login from "../../views/Login.vue";


const mainRoutes: RouteRecordRaw[] = [
    {
        path: '/',
        component: Login,
        children: [],
    }
];

export default mainRoutes;
