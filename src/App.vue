<!-- src/App.vue -->
<template>
  <div id="app">
    <PConfirmDialog />
    <PToast position="top-right" />

    <nav class="nav" role="navigation" aria-label="Ana gezinme">
      <div class="nav-left">
        <button class="brand-btn" @click="goTo('/')"
                aria-label="Ana sayfa">
          <!-- PrimeIcon briefcase kullanıldı: admin/panel hissi için -->
          <i class="pi pi-briefcase brand-icon" aria-hidden="true"></i>
        </button>
      </div>

      <div class="nav-center" role="menu" aria-label="Site menüsü">
        <PButton
          :class="['nav-btn', { active: isActive('/') }]"
          icon="pi pi-home"
          label="Home"
          class="p-button-text"
          @click="goTo('/')"
        />

        <PButton
          v-if="!auth.isAuthenticated"
          :class="['nav-btn', { active: isActive('/login') }]"
          icon="pi pi-sign-in"
          label="Login"
          class="p-button-text"
          @click="goTo('/login')"
        />

        <PButton
          v-if="!auth.isAuthenticated"
          :class="['nav-btn', { active: isActive('/register') }]"
          icon="pi pi-user-plus"
          label="Register"
          class="p-button-text"
          @click="goTo('/register')"
        />

        <PButton
          v-if="auth.isAuthenticated && auth.isAdmin"
          :class="['nav-btn', { active: isActive('/admin') }]"
          icon="pi pi-briefcase"
          label="Admin"
          class="p-button-text"
          @click="goTo('/admin')"
        />
      </div>

      <div class="nav-right">
        <div v-if="auth.isAuthenticated" class="right-group">
          <div class="user-chip" title="Hesap">
            <i class="pi pi-user" aria-hidden="true"></i>
            <span class="user-email">{{ shortEmail }}</span>
          </div>

          <PButton
            icon="pi pi-sign-out"
            label="Logout"
            class="p-button-raised logout-btn"
            @click="logout"
          />
        </div>

        <div v-else class="right-group">
          <!-- boş halde görünümü dengeli tutmak için -->
          <span class="guest-note">Hoşgeldiniz</span>
        </div>
      </div>
    </nav>

    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script>
import { useAuthStore } from "./stores/auth"
import { useRouter, useRoute } from "vue-router"
import { computed } from "vue"

export default {
  setup() {
    const auth = useAuthStore()
    const router = useRouter()
    const route = useRoute()

    function goTo(path) { router.push(path) }

    async function logout() {
      try {
        await auth.logout()
        router.push('/login')
      } catch (err) {
        console.error(err)
      }
    }

    const isActive = (path) => {
      return route.path === path
    }

    const shortEmail = computed(() => {
      if (!auth.isAuthenticated) return ''
      const e = auth.user?.email || ''
      if (e.length <= 18) return e
      return e.slice(0, 14) + '...'
    })

    return { auth, goTo, logout, isActive, shortEmail }
  }
}
</script>

<style scoped>
/* NAVBAR */
.nav {
  display:flex;
  align-items:center;
  gap:18px;
  padding:16px 22px;
  border-radius:12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  box-shadow: 0 10px 36px rgba(2,6,23,0.12);
  margin-bottom:18px;
  height:76px; /* biraz daha yüksek */
}

/* Left brand */
.nav-left { display:flex; align-items:center; }
.brand-btn {
  display:flex;
  align-items:center;
  gap:10px;
  border:0;
  background:transparent;
  color:inherit;
  cursor:pointer;
  padding:6px 8px;
  border-radius:10px;
  transition: transform .16s ease, box-shadow .16s ease;
}
.brand-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(2,6,23,0.12); }

/* brand-icon: artık PrimeIcon öğesi (font icon) */
.brand-icon {
  display:flex;
  align-items:center;
  justify-content:center;
  width:44px;
  height:44px;
  font-size:1.25rem;
  border-radius:10px;
  background: linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03));
  color: #fff;
  box-shadow: 0 8px 20px rgba(2,6,23,0.08);
}

/* Center nav buttons */
.nav-center {
  display:flex;
  gap:10px;
  align-items:center;
  flex:1;
  justify-content:center;
}

/* Nav button base */
.nav-btn {
  display:inline-flex;
  align-items:center;
  gap:8px;
  border-radius:12px;
  color: #ffffff;
  font-weight:700;
  transition: transform .14s cubic-bezier(.2,.9,.2,1), box-shadow .14s ease, background-color .14s ease;
  padding: 8px 12px;
}

/* Hover & active */
.nav-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 40px rgba(2,6,23,0.12);
  background: rgba(255,255,255,0.08);
}
.nav-btn.active {
  background: linear-gradient(90deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06));
  transform: translateY(-4px);
  box-shadow: 0 18px 40px rgba(2,6,23,0.14);
}

/* Ensure pi icons are visible and sized */
.nav-btn .pi { color: #fff; font-size: 1.05rem; }

/* Right area */
.nav-right { display:flex; align-items:center; gap:12px; justify-content:flex-end; min-width:260px; }
.right-group { display:flex; gap:10px; align-items:center; }

/* User chip */
.user-chip {
  display:flex;
  align-items:center;
  gap:8px;
  padding:8px 12px;
  background: rgba(255,255,255,0.08);
  border-radius:999px;
  color:#fff;
  font-weight:700;
  border:1px solid rgba(255,255,255,0.06);
}
.user-chip .pi { font-size:1rem; }

/* Logout button visual */
.logout-btn {
  --p-button-border-radius: 12px;
  --p-button-padding: 8px 14px;
  background: #ffffff !important;
  color: #4c2cf5 !important;
  box-shadow: 0 12px 30px rgba(76,44,245,0.12);
  border: 0;
  font-weight:800;
  transition: transform .14s ease, box-shadow .14s ease;
}
.logout-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 22px 48px rgba(76,44,245,0.18);
}

/* guest note */
.guest-note { color: rgba(255,255,255,0.9); font-weight:600; }

/* main container */
.container { padding: 20px; }

/* small utilities */
@media (max-width: 920px) {
  .nav { flex-wrap:wrap; height:auto; padding:12px; }
  .nav-center { justify-content:flex-start; width:100%; gap:6px; margin-top:8px; }
  .nav-right { min-width:auto; margin-left:auto; }
}
</style>
