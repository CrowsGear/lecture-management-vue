import { RouteRecordRaw } from "vue-router";
import AdminLayout from "../../layouts/AdminLayout.vue";

const adminRoutes: RouteRecordRaw[] = [
    {
        path: "/admin",
        component: AdminLayout,
        children: [
            {
                path: "schools",
                name: "SchoolManagement", 
                component: () => import("../../views/admin/SchoolManagement.vue"),
            },
            {
                path: "lectures",
                name: "LectureManagement",
                component: () => import("../../views/admin/LectureManagement.vue"),
            },
            {
                path: "students", 
                name: "StudentManagement",
                component: () => import("../../views/admin/StudentManagement.vue"),
            },
            {
                path: "grades",
                name: "GradeManagement", 
                component: () => import("../../views/admin/GradeManagement.vue"),
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
