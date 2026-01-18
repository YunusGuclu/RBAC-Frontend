// src/stores/auth.js
import { defineStore } from "pinia";
import api, { setTokens, clearTokens, logoutBackend } from "../lib/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    isAuthenticated: false,
    triedLoad: false,
  }),
  getters: {
    isAdmin: (state) => {
      const u = state.user || {};
      const roles = Array.isArray(u.roles) ? u.roles : [];
      const hasAdminRole = roles.some((r) => typeof r === "string" && r.toLowerCase() === "admin");
      return !!(hasAdminRole || u.is_staff || u.is_superuser);
    },
  },
  actions: {
    async login(email, password) {
      const resp = await api.post("/auth/login/", { email, password });
      const { access, refresh, user } = resp.data;
      setTokens({ access, refresh });
      this.user = user;
      this.isAuthenticated = true;
      return resp;
    },
    async register(payload) {
      const resp = await api.post("/auth/register/", payload);
      const { access, refresh, user } = resp.data;
      setTokens({ access, refresh });
      this.user = user;
      this.isAuthenticated = true;
      return resp;
    },
    async loadMe() {
      this.triedLoad = true;
      try {
        const resp = await api.get("/users/me/");
        this.user = resp.data;
        this.isAuthenticated = true;
        return resp;
      } catch (err) {
        this.user = null;
        this.isAuthenticated = false;
        clearTokens();
        throw err;
      }
    },
    logoutLocal() {
      clearTokens();
      this.user = null;
      this.isAuthenticated = false;
    },
    /**
     * Tam logout: backend'e refresh gönder (blacklist), sonra local temizle.
     */
    async logout() {
      try {
        await logoutBackend();
      } catch (e) {
        // ignored
      } finally {
        this.logoutLocal();
        window.location.href = "/";
      }
    },
  },
});
