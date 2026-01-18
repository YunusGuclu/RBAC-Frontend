// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import AdminPanel from "../views/AdminPanel.vue";
import { useAuthStore } from "../stores/auth";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },
  {
    path: "/admin",
    name: "Admin",
    component: AdminPanel,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  if (!auth.triedLoad && localStorage.getItem("access_token")) {
    try {
      await auth.loadMe();
    } catch (e) {
      // hata durumunda temizlenir ve redirect yapılır aşağıda
    }
  }

  if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated) {
      return next({ name: "Login" });
    }
    if (to.meta.requiresAdmin && !auth.isAdmin) {
      return next({ name: "Home" });
    }
  }

  if ((to.name === "Login" || to.name === "Register") && auth.isAuthenticated) {
    return next({ name: "Home" });
  }

  next();
});

export default router;
