<!-- src/views/Register.vue -->
<template>
  <main class="sakai-auth-shell">
    <div class="auth-card register">
      <div class="auth-brand">
        <div class="brand-mark" aria-hidden="true">
          <!-- Kare arka plan -->
          <svg viewBox="0 0 64 64" class="mark-svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
            <defs>
              <linearGradient id="lg-reg" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stop-color="#06B6D4"/>
                <stop offset="1" stop-color="#059669"/>
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="10" fill="url(#lg-reg)"/>
            <!-- Inline SVG user-plus icon -->
            <g transform="translate(12,10)" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="10" cy="8" r="6" />
              <path d="M2 26c1.5-6 8-8 16-8" stroke="#ffffffcc"/>
              <path d="M28 6v8 M24 10h8" stroke="#fff" stroke-width="2.2"/>
            </g>
          </svg>
        </div>

        <div class="brand-meta">
          <h2>Yeni Hesap Oluştur</h2>
          <p class="muted">Hızlıca kaydol ve yönetimi başlat</p>
        </div>
      </div>

      <form class="auth-form" @submit.prevent="doRegister" novalidate>
        <div class="grid">
          <div class="col">
            <label class="label">E-posta</label>
            <input v-model="email" type="email" class="input" required />
          </div>

          <div class="col">
            <label class="label">Kullanıcı adı (opsiyonel)</label>
            <input v-model="user_username" class="input" />
          </div>

          <div class="col">
            <label class="label">İsim</label>
            <input v-model="first_name" class="input" />
          </div>

          <div class="col">
            <label class="label">Soyisim</label>
            <input v-model="last_name" class="input" />
          </div>

          <div class="col">
            <label class="label">Şifre</label>
            <input v-model="password" type="password" class="input" required />
          </div>

          <div class="col">
            <label class="label">Şifre (tekrar)</label>
            <input v-model="password2" type="password" class="input" required />
          </div>
        </div>

        <div class="actions">
          <button class="btn btn-success" type="submit" :disabled="loading">{{ loading ? "Kayıt..." : "Kayıt Ol" }}</button>
          <router-link to="/login" class="link">Zaten hesabın var mı?</router-link>
        </div>

        <div v-if="error" class="alert error">{{ error }}</div>
      </form>
    </div>
  </main>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

export default {
  setup() {
    const auth = useAuthStore();
    const router = useRouter();

    const email = ref("");
    const user_username = ref("");
    const first_name = ref("");
    const last_name = ref("");
    const password = ref("");
    const password2 = ref("");
    const loading = ref(false);
    const error = ref("");

    async function doRegister() {
      error.value = "";
      loading.value = true;
      try {
        if (!email.value || !password.value || !password2.value) {
          error.value = "Gerekli alanlar eksik";
          return;
        }
        if (password.value !== password2.value) {
          error.value = "Şifreler eşleşmiyor";
          return;
        }
        await auth.register({
          email: email.value,
          user_username: user_username.value,
          first_name: first_name.value,
          last_name: last_name.value,
          password: password.value,
          password2: password2.value,
        });
        router.push("/");
      } catch (e) {
        if (e?.response?.data) {
          const d = e.response.data;
          error.value = typeof d === "string" ? d : d.detail || JSON.stringify(d);
        } else {
          error.value = e.message || "Kayıt başarısız";
        }
      } finally {
        loading.value = false;
      }
    }

    return { email, user_username, first_name, last_name, password, password2, loading, error, doRegister };
  },
};
</script>

<style scoped>
/* Shell */
.sakai-auth-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #F8FAFF 0%, #F3F5FF 50%, #FFFFFF 100%);
  padding: 28px;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}

/* Card */
.auth-card {
  width: 600px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 10px 30px rgba(16,24,40,0.06);
  border: 1px solid rgba(15,23,42,0.04);
  padding: 20px;
  display:flex;
  flex-direction:column;
  gap:12px;
}
.auth-card.register { width: 720px; max-width: 96%; }

/* Brand */
.auth-brand { display:flex; gap:12px; align-items:center; margin-bottom:4px; }
.brand-mark { width:64px; height:64px; border-radius:10px; overflow:visible; display:flex; align-items:center; justify-content:center; position:relative; }
.mark-svg { width:64px; height:64px; display:block; }

/* Brand meta */
.brand-meta h2 { margin:0; font-size:18px; color:#0f172a; font-weight:700; }
.brand-meta .muted { margin-top:2px; color:#6b7280; font-size:13px; }

/* grid of inputs */
.grid { display:grid; grid-template-columns: repeat(2, 1fr); gap:12px; margin-top:6px; }
.col { display:flex; flex-direction:column; gap:6px; }
.label { font-size:13px; color:#374151; font-weight:600; }
.input {
  height:44px;
  padding:10px 12px;
  border-radius:10px;
  border:1px solid #e6edf7;
  background:#fff;
  outline:none;
  font-size:14px;
  transition: box-shadow .12s ease, border-color .12s ease;
}
.input:focus {
  box-shadow: 0 6px 18px rgba(99,102,241,0.08);
  border-color: rgba(99,102,241,0.5);
}

/* actions */
.actions { margin-top:8px; display:flex; align-items:center; gap:12px; }
.btn { height:44px; padding:0 16px; border-radius:10px; border:0; cursor:pointer; font-weight:700; }
.btn-success {
  background: linear-gradient(90deg,#059669,#10B981);
  color:#fff;
  box-shadow: 0 6px 18px rgba(6,95,70,0.08);
}
.link { margin-left:auto; color:#6b7280; text-decoration:none; font-weight:600; font-size:14px; }
.alert.error { margin-top:8px; padding:10px 12px; border-radius:10px; background: #fff1f2; color:#991b1b; border: 1px solid rgba(239,68,68,0.12); font-weight:600; }

/* responsive */
@media (max-width: 980px) {
  .auth-card.register { width: 96%; padding:16px; }
  .grid { grid-template-columns: 1fr; }
}
</style>
