import { RouteRecordRaw } from 'vue-router';
import AdminLayout from "../../layouts/AdminLayout.vue";
import SchoolManagement from "../../views/admin/school/SchoolManagement.vue";

const adminRoutes: RouteRecordRaw[] = [
    {
        path: '/admin',
        component: AdminLayout,
        children: [
            {
                path: "schools",
                name: "SchoolManagement",
                component: SchoolManagement,
            },
            {
                path: "students",
                name: "StudentManagement",
                component: SchoolManagement,
            },
            {
                path: "grades",
                name: "GradeManagement",
                component: SchoolManagement,
            }
        ],
    }
];

export default adminRoutes;
