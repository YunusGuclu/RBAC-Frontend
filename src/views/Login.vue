<!-- src/views/Login.vue -->
<template>
  <main class="sakai-auth-shell">
    <div class="auth-card register">
      <div class="auth-brand">
        <div class="brand-mark" aria-hidden="true">
          <!-- Yeni ikon: modern shield + keyhole -->
          <svg viewBox="0 0 80 80" class="mark-svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
            <defs>
              <linearGradient id="lg-shield" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stop-color="#4F46E5"/>
                <stop offset="1" stop-color="#06B6D4"/>
              </linearGradient>
              <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#0f172a" flood-opacity="0.12"/>
              </filter>
            </defs>

            <!-- dış gölge -->
            <g filter="url(#shadow)">
              <!-- shield body -->
              <path d="M40 4c0 0 20 6 28 14 8 8 8 22 8 26 0 22-20 30-36 38C24 74 4 64 4 44 4 40 4 26 12 18 20 10 40 4 40 4z"
                    fill="url(#lg-shield)"/>
            </g>

            <!-- iç yüzey parlaklık -->
            <path d="M40 8c14 4 24 14 28 20-4 6-6 14-6 20 0 18-14 26-24 31-10-5-24-13-24-31 0-6-2-14-6-20C16 22 26 12 40 8z"
                  fill="rgba(255,255,255,0.06)"/>

            <!-- keyhole (delik) -->
            <g transform="translate(34,26)">
              <circle cx="6" cy="6" r="4.2" fill="#fff"/>
              <rect x="4.2" y="10.2" width="3.6" height="10" rx="1.8" fill="#fff"/>
            </g>

            <!-- küçük accent çizgi -->
            <path d="M24 18 C34 14 46 12 56 18" stroke="rgba(255,255,255,0.12)" stroke-width="1.6" fill="none" stroke-linecap="round"/>
          </svg>
        </div>

        <div class="brand-meta">
          <h2>Hesabına Giriş Yap</h2>
          <p class="muted">E-posta ve şifren ile oturum aç</p>
        </div>
      </div>

      <form class="auth-form" @submit.prevent="doLogin" novalidate>
        <div class="grid-single">
          <div class="col full">
            <label class="label">E-posta</label>
            <input v-model="email" type="email" class="input" placeholder="you@example.com" required autocomplete="email" />
          </div>

          <div class="col full">
            <label class="label">Şifre</label>
            <input v-model="password" type="password" class="input" placeholder="Şifreniz" required autocomplete="current-password" />
          </div>
        </div>

        <div class="actions">
          <button class="btn btn-primary" type="submit" :disabled="loading">
            {{ loading ? "Giriş..." : "Giriş Yap" }}
          </button>

          <router-link to="/register" class="link">Kayıt ol</router-link>
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
    const password = ref("");
    const loading = ref(false);
    const error = ref("");

    async function doLogin() {
      error.value = "";
      loading.value = true;
      try {
        if (!email.value || !password.value) {
          error.value = "Email ve şifre gerekli";
          return;
        }
        await auth.login(email.value, password.value);
        router.push(auth.isAdmin ? "/admin" : "/");
      } catch (e) {
        if (e?.response?.data) {
          const d = e.response.data;
          error.value = d.detail || JSON.stringify(d);
        } else {
          error.value = e.message || "Giriş başarısız";
        }
      } finally {
        loading.value = false;
      }
    }

    return { email, password, loading, error, doLogin };
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
.brand-mark { width:80px; height:80px; border-radius:12px; overflow:visible; display:flex; align-items:center; justify-content:center; position:relative; }
.mark-svg { width:80px; height:80px; display:block; }

/* Brand meta */
.brand-meta h2 { margin:0; font-size:18px; color:#0f172a; font-weight:700; }
.brand-meta .muted { margin-top:2px; color:#6b7280; font-size:13px; }

/* Form layout */
.grid-single { display:grid; grid-template-columns: 1fr; gap:12px; margin-top:6px; }
.col { display:flex; flex-direction:column; gap:6px; }
.col.full { grid-column: 1 / -1; }

/* Inputs */
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

/* Actions */
.actions { margin-top:8px; display:flex; align-items:center; gap:12px; }
.btn { height:44px; padding:0 16px; border-radius:10px; border:0; cursor:pointer; font-weight:700; }
.btn-primary {
  background: linear-gradient(90deg,#6D28D9,#7C3AED);
  color:#fff;
  box-shadow: 0 6px 18px rgba(124,58,237,0.12);
}
.link { margin-left:auto; color:#6b7280; text-decoration:none; font-weight:600; font-size:14px; }
.link:hover { text-decoration:underline; color:#4b5563; }

/* Error */
.alert.error { margin-top:8px; padding:10px 12px; border-radius:10px; background: #fff1f2; color:#991b1b; border: 1px solid rgba(239,68,68,0.12); font-weight:600; }
.helper { margin-top:4px; display:flex; justify-content:flex-end; }
.linkless { color:#6b7280; text-decoration:none; font-weight:600; }
.linkless:hover { text-decoration:underline; }

/* Responsive */
@media (max-width: 980px) {
  .auth-card.register { width: 96%; padding:16px; }
  .grid-single { grid-template-columns: 1fr; }
}
</style>
