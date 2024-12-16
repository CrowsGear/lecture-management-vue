import { RouteRecordRaw } from 'vue-router';
import AdminLayout from "../../layouts/AdminLayout.vue";

const adminRoutes: RouteRecordRaw[] = [
    {
        path: '/admin',
        component: AdminLayout,
        children: [
            {
                path: "schools",
                name: "SchoolManagement", 
                component: () => import("../../views/admin/school/SchoolManagement.vue"),
            },
            {
                path: "students", 
                name: "StudentManagement",
                component: () => import("../../views/admin/school/StudentManagement.vue"),
            },
            {
                path: "grades",
                name: "GradeManagement", 
                component: () => import("../../views/admin/school/GradeManagement.vue"),
            },
            {
                path: "banners",
                name: "BannerManagement",
                component: () => import("../../views/admin/BannerManagement.vue"),
            }
        ],
    }
];

export default adminRoutes;
