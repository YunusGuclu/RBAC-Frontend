<!-- src/views/Home.vue -->
<template>
  <div>
    <h1>Hoşgeldiniz</h1>
    <p v-if="auth.isAuthenticated">Giriş yapan: {{ auth.user?.email }}</p>
    <p v-else>Giriş yap veya kayıt ol.</p>
  </div>
</template>

<script>
import { useAuthStore } from "../stores/auth";
export default {
  setup() {
    const auth = useAuthStore();
    return { auth };
  },
};
</script>
