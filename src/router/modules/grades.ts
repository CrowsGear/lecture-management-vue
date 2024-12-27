import { RouteRecordRaw } from "vue-router";
import GradeViewLayout from "../../layouts/GradeViewLayout.vue";


const gradesRoutes: RouteRecordRaw[] = [
    {
        path: "/grades",
        component: GradeViewLayout,
        children: [
            {
                path: "",
                component: () => import("../../views/GradeView.vue"),
            }
        ],
    }
];

export default gradesRoutes;