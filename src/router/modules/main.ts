import type { RouteRecordRaw } from "vue-router";
import HomeLayout from "../../layouts/HomeLayout.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: HomeLayout,
    children: [
      {
        path: "",
        redirect: "/login"
      },
      {
        path: "login",
        name: "login",
        component: () => import("../../views/Login.vue")
      }
    ]
  }
];

export default routes;
