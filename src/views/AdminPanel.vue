<!-- src/views/AdminPanel.vue (FULL - replace existing file) -->
<template>
  <main class="admin-shell">
    <!-- compact header: brand solda, search ortada, actions sağda -->
    <header class="admin-header">
      <div class="header-left">
        <svg class="brand-logo" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L3 7v6c0 5 3.6 9.6 9 11 5.4-1.4 9-6 9-11V7l-9-5z"/></svg>
        <div class="brand-text">
          <h1>Admin Panel</h1>
          <p class="subtitle">Kullanıcı & Rol yönetimi</p>
        </div>
      </div>

      <div class="header-center">
        <div class="search-wrap">
          <i class="pi pi-search" aria-hidden="true"></i>
          <input v-model="q" placeholder="Kullanıcı ara..." aria-label="Kullanıcı ara" />
        </div>
      </div>

      <div class="header-right">
        <PButton label="Yenile" icon="pi pi-refresh" class="p-button-outlined" @click="loadAll" :loading="loading.global" />
        <PButton label="Roller" icon="pi pi-briefcase" class="p-button" @click="openCreateRole" />
      </div>
    </header>

    <!-- layout: roles left narrow, users right wide -->
    <section class="admin-grid">
      <!-- Roles (left) -->
      <aside class="card col-roles">
        <div class="roles-head">
          <h3>Roller</h3>
          <div class="muted small">{{ roles.length }} adet</div>
        </div>

        <div class="roles-list-wrap">
          <div v-if="loading.roles" class="loading-placeholder">Roller yükleniyor...</div>
          <div v-else-if="!roles.length" class="empty-placeholder">Henüz rol yok.</div>

          <ul v-else class="roles-list">
            <li v-for="r in roles" :key="roleIdOf(r)" :class="['role-entry', {selected: selectedRole && roleIdOf(selectedRole) === roleIdOf(r)}]" @click="selectRole(r)">
              <div class="role-entry-left">
                <div class="role-avatar" :title="roleNameOf(r)">{{ (roleNameOf(r)||'')[0] || 'R' }}</div>
                <div class="role-meta">
                  <div class="role-name" :title="roleNameOf(r)">{{ roleNameOf(r) }}</div>
                  <div class="muted small ellipsis">{{ r.role_detail || r.detail || '' }}</div>
                </div>
              </div>

              <div class="role-entry-right">
                <PButton icon="pi pi-trash" class="p-button-text" @click.stop="confirmDeleteRole(r)" />
              </div>
            </li>
          </ul>
        </div>

        <!-- seçili rol küçük özet, açılır detay -->
        <div class="selected-role-box" v-if="selectedRole">
          <div class="selected-head">
            <div>
              <div class="selected-role-name">{{ roleNameOf(selectedRole) }}</div>
              <div class="muted small">ID: {{ roleIdOf(selectedRole) }}</div>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
              <PButton icon="pi pi-refresh" class="p-button-text" @click="loadRoleDetail(roleIdOf(selectedRole))" />
              <PButton label="FMC Düzenle" icon="pi pi-pencil" class="p-button-text" @click="openEditRoleFMCs(selectedRole)" />
            </div>
          </div>

          <div v-if="loading.roleDetail" class="muted">Yükleniyor...</div>
          <div v-else-if="roleDetailGrouped.length === 0" class="muted">Bu role bağlı modül/fonksiyon yok.</div>

          <div v-else class="role-detail-compact">
            <details v-for="group in roleDetailGrouped" :key="group.module.mod_id ?? group.module.mod_name" class="module-details">
              <summary>
                <span class="module-title">{{ group.module.mod_name ?? group.module.module_name ?? group.module }}</span>
                <span class="muted small">{{ group.functions.length }} fonksiyon</span>
              </summary>

              <div class="module-funcs">
                <div v-for="fn in group.functions" :key="fn.func_id ?? fn.func_name ?? fn.fmc_id" class="func-line">
                  <div class="func-title">{{ fn.func_name ?? fn.function_name ?? fn.func }}</div>
                  <div class="muted tiny">{{ fn.fmc_id ? 'fmc:' + fn.fmc_id : '' }}</div>
                </div>
              </div>
            </details>
          </div>
        </div>
      </aside>

      <!-- Users (right, wide) -->
      <section class="card col-users">
        <div class="users-head">
          <h3>Kullanıcılar</h3>
          <div class="muted small">{{ users.length }} kullanıcı</div>
        </div>

        <div class="users-grid-wrap">
          <div v-if="loading.users" class="loading-placeholder">Kullanıcılar yükleniyor...</div>
          <div v-else-if="!users.length" class="empty-placeholder">Henüz kullanıcı yok.</div>

          <div v-else class="users-grid">
            <!-- kart bazlı görünüm, responsive; pagination kontrolü template'in dışından yönetilebilir -->
            <div v-for="u in pagedUsers" :key="userIdOf(u)" class="user-card" @click="selectUser(u)">
              <div class="user-card-top">
                <div class="avatar">{{ avatarInitials(u) }}</div>
                <div class="user-info">
                  <div class="name" :title="u.displayName || u.email">{{ u.displayName || u.email }}</div>
                  <div class="muted small ellipsis" :title="u.email">{{ u.email }}</div>
                </div>
              </div>

              <div class="user-card-bottom">
                <div class="user-roles">
                  <span v-if="getUserRoles(u).length === 0" class="muted">—</span>
                  <span v-else>
                    <span v-for="r in getUserRoles(u)" :key="roleIdOf(r)" class="chip tiny">{{ roleNameOf(r) }}</span>
                  </span>
                </div>

                <div class="user-actions">
                  <PButton icon="pi pi-user-plus" class="p-button-rounded p-button-secondary" @click.stop="openAssignDialog(u)" title="Rol Ata" />
                  <PButton icon="pi pi-eye" class="p-button-rounded p-button-text" @click.stop="selectUser(u)" title="Detay" />
                </div>
              </div>
            </div>
          </div>

          <!-- basit pagination kontrolü -->
          <div v-if="users.length > usersPerPage" class="pagination-wrap">
            <button class="pg-btn" :disabled="currentPage === 1" @click="currentPage--">‹</button>
            <span class="pg-info">Sayfa {{ currentPage }} / {{ totalPages }}</span>
            <button class="pg-btn" :disabled="currentPage === totalPages" @click="currentPage++">›</button>
          </div>
        </div>
      </section>
    </section>

    <!-- floating Yeni Rol butonu (aynı işlev) -->
    <div class="floating-create">
      <PButton label="Yeni Rol Oluştur" icon="pi pi-plus" class="p-button-lg p-button-rounded" @click="openCreateRole" />
    </div>

    <!-- Create Role Dialog (unchanged, but styling harmonized) -->
    <PDialog header="Yeni Rol Oluştur ve FMC Ata" v-model:visible="showCreateRole" :modal="true" :closable="true" :style="{width:'820px'}">
      <div class="create-dialog">
        <div class="create-left">
          <label class="label">Rol Adı</label>
          <input v-model="newRole.name" class="p-inputtext p-component input-large" />

          <label class="label" style="margin-top:10px">Açıklama</label>
          <textarea v-model="newRole.detail" class="p-inputtextarea p-component" rows="3" />

          <div style="margin-top:8px; color:#111; font-weight:600">Seçili FMC sayısı: {{ selectedFmcIds.length }}</div>
        </div>

        <div class="create-right">
          <div class="fmc-header">
            <div class="fmc-title">Mevcut Modül - Fonksiyonlar</div>
            <input type="text" v-model="fmcSearch" placeholder="Modül / fonksiyon ara..." class="fmc-search" />
          </div>

          <div v-if="loading.functionModules" class="muted" style="padding:10px">Yükleniyor...</div>
          <div v-else-if="!functionModules.length" class="muted" style="padding:10px">Sunucuda tanımlı FMC yok.</div>
          <div v-else class="fmc-list">
            <div v-for="group in filteredFmcGroups" :key="group.module" class="fmc-module-group">
              <div class="fmc-module-head">
                <div class="fmc-module-name">{{ group.module }}</div>
                <div>
                  <button class="select-all-btn" @click="toggleSelectModule(group)">
                    {{ isModuleFullySelected(group) ? 'Tümünü Kaldır' : 'Tümünü Seç' }}
                  </button>
                </div>
              </div>

              <div class="fmc-items">
                <label v-for="f in group.items" :key="f.fmc_id" class="fmc-item">
                  <input type="checkbox" :value="f.fmc_id" v-model="selectedFmcIds" />
                  <div class="fmc-item-meta">
                    <div class="fmc-func-name">{{ f.function_name }}</div>
                    <div class="fmc-func-sub muted-small">{{ f.module_name }}</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:12px">
        <PButton label="İptal" class="p-button-text" @click="showCreateRole = false" />
        <PButton label="Oluştur ve Ata" class="p-button" @click="createRoleWithFMCs" :loading="loading.createRole" />
      </div>
    </PDialog>

    <!-- Edit Role FMCs Dialog -->
    <PDialog header="Rolün Modül/Fonksiyonlarını Güncelle" v-model:visible="showEditRoleFmc" :modal="true" :closable="true" :style="{width:'820px'}">
      <div class="create-dialog">
        <div class="create-left">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <div>
              <div style="font-weight:800; font-size:16px">{{ roleNameOf(selectedRole) }}</div>
              <div class="muted small">ID: {{ roleIdOf(selectedRole) }}</div>
            </div>
            <div class="muted small">Seçili: {{ editSelectedFmcIds.length }}</div>
          </div>

          <label class="label">Açıklama</label>
          <textarea v-model="editRoleDetail" class="p-inputtextarea p-component" rows="2"></textarea>

          <div style="margin-top:10px; color:#111; font-weight:600">Modül / Fonksiyon seçimi</div>
          <div class="muted small" style="margin-top:6px">Mevcut FMC'leri işaretleyin veya seçimleri kaldırın. Kaydettiğinizde eklenenler oluşturulur, kaldırılanlar silinir.</div>
        </div>

        <div class="create-right">
          <div class="fmc-header">
            <div class="fmc-title">Mevcut Modül - Fonksiyonlar</div>
            <input type="text" v-model="fmcSearch" placeholder="Modül / fonksiyon ara..." class="fmc-search" />
          </div>

          <div v-if="loading.functionModules" class="muted" style="padding:10px">Yükleniyor...</div>
          <div v-else-if="!functionModules.length" class="muted" style="padding:10px">Sunucuda tanımlı FMC yok.</div>
          <div v-else class="fmc-list">
            <div v-for="group in filteredFmcGroups" :key="group.module" class="fmc-module-group">
              <div class="fmc-module-head">
                <div class="fmc-module-name">{{ group.module }}</div>
                <div>
                  <button class="select-all-btn" @click="toggleEditModule(group)">
                    {{ isEditModuleFullySelected(group) ? 'Tümünü Kaldır' : 'Tümünü Seç' }}
                  </button>
                </div>
              </div>

              <div class="fmc-items">
                <label v-for="f in group.items" :key="f.fmc_id" class="fmc-item">
                  <input type="checkbox" :value="f.fmc_id" v-model="editSelectedFmcIds" />
                  <div class="fmc-item-meta">
                    <div class="fmc-func-name">{{ f.function_name }}</div>
                    <div class="fmc-func-sub muted-small">{{ f.module_name }}</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:12px">
        <PButton label="İptal" class="p-button-text" @click="showEditRoleFmc = false" />
        <PButton label="Güncelle" class="p-button" @click="saveRoleFmcUpdates" :loading="loading.createRole" />
      </div>
    </PDialog>

    <!-- Assign dialog: redesigned and fixed -->
    <PDialog header="Kullanıcıya Rol Ata" v-model:visible="showAssignDialog" :modal="true" :closable="true" :dismissableMask="true" :style="{width:'920px'}">
      <div class="assign-wrap" role="dialog" aria-modal="true">
        <!-- left: user card (white) -->
        <div class="assign-left">
          <div class="user-card white-card">
            <div class="avatar-large">{{ avatarInitials(activeUser) }}</div>
            <div class="user-info">
              <div class="name" style="color:#0f172a">{{ activeUser?.displayName ?? '-' }}</div>
              <div class="muted small" style="color:#0f172a">{{ activeUser?.email ?? '' }}</div>
            </div>

            <div class="current-roles" style="color:#0f172a; margin-top:10px">
              <div class="muted small" style="color:#6b7280">Mevcut roller</div>
              <div v-if="currentUserRoles.length === 0" class="muted" style="color:#0f172a; margin-top:6px">Atanmış rol yok.</div>
              <div v-else style="margin-top:6px">
                <span v-for="r in currentUserRoles" :key="roleIdOf(r)" class="chip small" style="background:#eef2ff;color:#1e3a8a; margin-right:6px;">
                  {{ roleNameOf(r) }}
                  <button class="remove-small" @click.stop="removeUserRole(r)">×</button>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- right: roles available to assign -->
        <div class="assign-right">
          <div class="assign-header" style="margin-bottom:8px;">
            <h4 style="margin:0">Roller</h4>
            <div class="muted small">Atanabilecek roller: {{ rolesAssignable.length }}</div>
          </div>

          <div class="assign-list-card">
            <div v-if="loading.roles" class="muted" style="color:#0f172a">Yükleniyor...</div>

            <div v-else-if="rolesAssignable.length === 0" style="color:#0f172a">Atanabilecek yeni rol yok.</div>

            <div v-else>
              <div v-for="r in rolesAssignable" :key="roleIdOf(r)" class="assign-row white-row">
                <div class="assign-meta">
                  <div class="assign-name" style="color:#0f172a">{{ roleNameOf(r) }}</div>
                  <div class="muted small" style="color:#374151">{{ r.role_detail || r.detail || '' }}</div>
                </div>
                <div>
                  <PButton
                    label="Ata"
                    class="p-button-primary p-button-sm styled-pbtn"
                    @click.stop="assignRoleToUserWithRole(roleIdOf(r))"
                    :loading="loading.assign"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="assign-footer" style="margin-top:12px; display:flex; justify-content:flex-end;">
            <PButton label="Kapat" class="p-button-text" @click="showAssignDialog = false" />
          </div>
        </div>
      </div>
    </PDialog>
  </main>
</template>

<script setup>
/* SCRIPT BÖLÜMÜ: ORİJİNAL KODUN TEMELİ KORUNDU, ASSIGN VE EDIT FMC İŞLEMLERİ EKLENDİ */
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '../lib/api'

const toast = useToast()

/* state */
const q = ref('')
const users = ref([])
const roles = ref([])
const roleUsers = ref([])

const loading = ref({
  global: false,
  users: false,
  roles: false,
  roleUsers: false,
  roleDetail: false,
  functionModules: false,
  createRole: false,
  assign: false
})

const selectedRole = ref(null)
const roleDetailGrouped = ref([])

/* function-modules list + selection */
const functionModules = ref([])
const selectedFmcIds = ref([])
const fmcSearch = ref('')

const showCreateRole = ref(false)
const newRole = ref({ name: '', detail: '' })

const showAssignDialog = ref(false)
const activeUser = ref(null)
const assignRoleId = ref(null)
const assignRoleDetail = ref([])

/* --- EDIT FMC state --- */
const showEditRoleFmc = ref(false)
const editSelectedFmcIds = ref([]) // editable selection for role
const editRoleDetail = ref('') // optional: allow editing role detail text
let existingRoleRfmcRows = {} // map fmc_id -> rfmc_row_id (populated when opening edit)

 /* helpers */
function userIdOf(u) { return u?.id ?? u?.user_id ?? u?.pk ?? null }
function roleIdOf(r) { return r?.role_id ?? r?.id ?? r?.roleId ?? r?.pk ?? null }
function roleNameOf(r) { return r?.role_name ?? r?.name ?? r?.roleName ?? '' }

function avatarInitials(u) {
  if (!u) return ''
  const name = (u.first_name || u.user_firstname || u.firstName || '') + ' ' + (u.last_name || u.user_lastname || '')
  const n = name.trim() || u.user_username || u.email || ''
  return n.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()
}

/* computed */
/* search filtered */
const filteredUsers = computed(() => {
  if (!q.value) return users.value
  const t = q.value.toLowerCase()
  return users.value.filter(u => (u.displayName || u.email || '').toLowerCase().includes(t))
})

/* pagination: kullanıcıları 15'er göster, sonra simple prev/next */
const usersPerPage = 15
const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / usersPerPage)))
const pagedUsers = computed(() => {
  // ensure currentPage stays in bounds
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
  const start = (currentPage.value - 1) * usersPerPage
  return filteredUsers.value.slice(start, start + usersPerPage)
})

/* computed list for assign dialog: roles that are NOT already assigned to active user */
const currentUserRoles = computed(() => {
  if (!activeUser.value) return []
  const uid = userIdOf(activeUser.value)
  const assigned = roleUsers.value.filter(x => {
    const xu = x.user ?? x.user_id ?? x.userId ?? null
    if (typeof xu === 'object' && xu !== null) return (xu.id ?? xu.user_id ?? xu.pk) === uid
    return xu === uid
  })
  return assigned.map(a => {
    const r = a.role ?? a.role_obj ?? a.role_id ?? a.roleId
    if (typeof r === 'object' && r !== null) return r
    return roles.value.find(rr => roleIdOf(rr) === (a.role_id ?? a.role ?? a.roleId)) || { role_name: String(a.role ?? a.role_id) }
  })
})

const rolesAssignable = computed(() => {
  if (!roles.value || roles.value.length === 0) return []
  if (!activeUser.value) return roles.value
  const assignedIds = new Set(currentUserRoles.value.map(r => roleIdOf(r)))
  return roles.value.filter(r => !assignedIds.has(roleIdOf(r)))
})

/* group functionModules by module for UI */
const fmcGroupedByModule = computed(() => {
  const map = new Map()
  functionModules.value.forEach(f => {
    const modName = (f.module_name ?? f.module ?? '—')
    if (!map.has(modName)) map.set(modName, [])
    map.get(modName).push(f)
  })
  return Array.from(map.entries()).map(([module, items]) => ({ module, items }))
})

/* filtered groups by search */
const filteredFmcGroups = computed(() => {
  const qLower = (fmcSearch.value || '').toLowerCase().trim()
  if (!qLower) return fmcGroupedByModule.value
  return fmcGroupedByModule.value
    .map(g => {
      const items = g.items.filter(it => {
        return (String(it.function_name || '') + ' ' + String(it.module_name || '')).toLowerCase().includes(qLower)
      })
      return { module: g.module, items }
    })
    .filter(g => g.items.length > 0)
})

/* helper to show toast */
function showToast(sev, summary, detail) {
  toast.add({ severity: sev, summary, detail, life: 3500 })
}

/* Loaders (unchanged) */
async function loadUsers() {
  loading.value.users = true
  try {
    const res = await api.get('/users/')
    users.value = (res.data || []).map(u => ({
      ...u,
      displayName: (u.first_name || u.user_firstname || u.firstName) ? `${(u.first_name || u.user_firstname || u.firstName)} ${(u.last_name || u.user_lastname || '')}`.trim() : (u.user_username || u.username || u.email),
      email: u.email ?? u.user_email
    }))
  } catch (err) {
    showToast('warn', 'Hata', 'Kullanıcılar yüklenemedi')
    users.value = []
    console.error(err)
  } finally {
    loading.value.users = false
  }
}

async function loadRoles() {
  loading.value.roles = true
  try {
    const res = await api.get('/roles/')
    roles.value = res.data || []
    console.log('[AdminPanel] /roles/ fetched', roles.value.length)
  } catch (err) {
    showToast('warn', 'Hata', 'Roller yüklenemedi')
    roles.value = []
    console.error(err)
  } finally {
    loading.value.roles = false
  }
}

async function loadRoleUsers() {
  loading.value.roleUsers = true
  try {
    const res = await api.get('/role-user/')
    roleUsers.value = res.data || []
  } catch (err) {
    roleUsers.value = []
    console.warn(err)
  } finally {
    loading.value.roleUsers = false
  }
}

async function loadFunctionModules() {
  loading.value.functionModules = true
  try {
    const res = await api.get('/function-modules/')
    functionModules.value = Array.isArray(res.data) ? res.data : (res.data?.results ?? [])
  } catch (err) {
    functionModules.value = []
    console.error(err)
    showToast('warn','Hata','Function-modules yüklenemedi')
  } finally {
    loading.value.functionModules = false
  }
}

async function loadAll() {
  loading.value.global = true
  await Promise.all([loadUsers(), loadRoles(), loadRoleUsers(), loadFunctionModules()])
  if (selectedRole.value) await loadRoleDetail(roleIdOf(selectedRole.value))
  loading.value.global = false
}

/* ---------- robust role detail loader (unchanged) ---------- */
async function loadRoleDetail(rid) {
  roleDetailGrouped.value = []
  if (!rid) return
  loading.value.roleDetail = true
  console.log('[AdminPanel] loading role detail for', rid)

  try {
    const rfmcRes = await api.get('/role-function-modules/', { params: { role_id: rid } }).catch(e => e?.response ? e.response : null)
    const rfmcRaw = Array.isArray(rfmcRes?.data) ? rfmcRes.data : (rfmcRes?.data?.results ? rfmcRes.data.results : [])
    const rfmcList = (rfmcRaw || []).filter(r => {
      const rv = r.role ?? r.role_id ?? r.roleId ?? null
      if (rv == null) return false
      if (typeof rv === 'object') {
        return Number(rv.role_id ?? rv.id ?? rv.pk ?? rv) === Number(rid)
      } else {
        return Number(rv) === Number(rid)
      }
    })
    console.log('[AdminPanel] rfmc rows fetched:', rfmcRaw.length, 'after local filter:', rfmcList.length)

    if (rfmcList.length === 0) {
      roleDetailGrouped.value = []
      loading.value.roleDetail = false
      return
    }

    const hasFmcDetail = rfmcList.some(r => r.fmc_detail)
    let fmcMap = new Map()

    if (hasFmcDetail) {
      rfmcList.forEach(r => {
        const f = r.fmc_detail
        if (f && (f.fmc_id || f.fmc)) {
          const fid = Number(f.fmc_id ?? f.fmc)
          fmcMap.set(fid, {
            fmc_id: fid,
            module: { mod_id: Number(f.module), mod_name: f.module_name ?? f.module },
            function: { func_id: Number(f.function), func_name: f.function_name ?? f.function }
          })
        }
      })
    } else {
      const fmcIds = [...new Set(rfmcList.map(r => Number(r.fmc ?? r.fmc_id)).filter(Boolean))]
      if (fmcIds.length > 0) {
        try {
          const bulkRes = await api.get('/function-modules/', { params: { ids: fmcIds.join(',') } })
          const bulkData = Array.isArray(bulkRes.data) ? bulkRes.data : (bulkRes.data?.results ?? [])
          if (Array.isArray(bulkData) && bulkData.length > 0) {
            bulkData.forEach(f => {
              const fid = Number(f.fmc_id ?? f.id ?? f.fmc)
              fmcMap.set(fid, {
                fmc_id: fid,
                module: (f.module && typeof f.module === 'object') ? { mod_id: f.module.mod_id ?? f.module.id, mod_name: f.module.mod_name ?? f.module.name } : { mod_id: f.module, mod_name: f.module_name ?? f.module },
                function: (f.function && typeof f.function === 'object') ? { func_id: f.function.func_id ?? f.function.id, func_name: f.function.func_name ?? f.function.name } : { func_id: f.function, func_name: f.function_name ?? f.function }
              })
            })
          } else {
            throw new Error('bulk empty')
          }
        } catch (errBulk) {
          const promises = fmcIds.map(id => api.get(`/function-modules/${id}/`).then(r => r.data).catch(() => null))
          const results = await Promise.all(promises)
          results.forEach(f => {
            if (!f) return
            const fid = Number(f.fmc_id ?? f.id ?? f.fmc)
            fmcMap.set(fid, {
              fmc_id: fid,
              module: (f.module && typeof f.module === 'object') ? { mod_id: f.module.mod_id ?? f.module.id, mod_name: f.module.mod_name ?? f.module.name } : { mod_id: f.module, mod_name: f.module_name ?? f.module },
              function: (f.function && typeof f.function === 'object') ? { func_id: f.function.func_id ?? f.function.id, func_name: f.function.func_name ?? f.function.name } : { func_id: f.function, func_name: f.function_name ?? f.function }
            })
          })
        }
      }
    }

    const grouped = new Map()
    rfmcList.forEach(r => {
      const rfmc_id = r.rfmc_id ?? r.id ?? null
      let fmcObj = null

      if (r.fmc_detail) {
        const f = r.fmc_detail
        const fid = Number(f.fmc_id ?? f.fmc)
        fmcObj = {
          fmc_id: fid,
          module: { mod_id: Number(f.module), mod_name: f.module_name ?? f.module },
          function: { func_id: Number(f.function), func_name: f.function_name ?? f.function }
        }
      } else {
        const fid = Number(r.fmc ?? r.fmc_id)
        if (fmcMap.has(fid)) {
          fmcObj = fmcMap.get(fid)
        } else {
          fmcObj = {
            fmc_id: fid,
            module: { mod_id: r.fmc_module ?? r.module ?? r.module_id ?? null, mod_name: r.fmc_module_name ?? r.module_name ?? (r.module && r.module.mod_name) ?? null },
            function: { func_id: r.fmc_function ?? r.function ?? r.function_id ?? null, func_name: r.fmc_function_name ?? r.function_name ?? (r.function && r.function.func_name) ?? null }
          }
        }
      }

      if (!fmcObj) return

      const modKey = (fmcObj.module.mod_id ?? fmcObj.module.mod_name ?? String(fmcObj.module))
      if (!grouped.has(modKey)) grouped.set(modKey, { module: fmcObj.module, functions: [] })
      const g = grouped.get(modKey)
      const funcId = fmcObj.function.func_id ?? fmcObj.function.func_name
      if (!g.functions.some(x => (x.func_id ?? x.func_name) === funcId)) {
        g.functions.push({
          func_id: fmcObj.function.func_id,
          func_name: fmcObj.function.func_name,
          fmc_id: fmcObj.fmc_id,
          rfmc_id: rfmc_id
        })
      }
    })

    const groupedArr = Array.from(grouped.values()).map(g => {
      g.functions.sort((a,b) => ((a.func_name||'').localeCompare(b.func_name||'')))
      return g
    }).sort((a,b) => ((a.module.mod_name||'').localeCompare(b.module.mod_name||'')))

    roleDetailGrouped.value = groupedArr
    console.log('[AdminPanel] roleDetailGrouped (final):', roleDetailGrouped.value)
  } catch (err) {
    console.error(err)
    showToast('warn','Hata','Rol detayları alınamadı')
    roleDetailGrouped.value = []
  } finally {
    loading.value.roleDetail = false
  }
}

/* create / delete role + attach FMCs (unchanged) */
async function createRoleWithFMCs() {
  const name = (newRole.value.name || '').trim()
  if (!name) { showToast('warn','Uyarı','Rol adı gerekli'); return }
  loading.value.createRole = true

  try {
    // 1) create role
    let resp = await api.post('/roles/', { role_name: name, role_detail: newRole.value.detail || '' })
    let created = resp.data || {}
    let createdRoleId = Number(created.role_id ?? created.id ?? created.roleId ?? created.pk ?? created?.role ?? null)
    if (!createdRoleId) {
      await loadRoles()
      const found = roles.value.find(r => (r.role_name ?? r.name) === name)
      if (found) createdRoleId = roleIdOf(found)
    }
    if (!createdRoleId) throw new Error('Rol oluşturuldu ama ID alınamadı')

    // 2) attach selected FMCs (if any)
    const fmcIds = [...new Set((selectedFmcIds.value || []).map(x => Number(x)).filter(Boolean))]
    if (fmcIds.length > 0) {
      for (const fid of fmcIds) {
        const payloadCandidates = [
          { role: createdRoleId, fmc: fid },
          { role_id: createdRoleId, fmc_id: fid },
          { role: createdRoleId, fmc_id: fid },
          { role_id: createdRoleId, fmc: fid }
        ]
        let ok = false
        for (const pl of payloadCandidates) {
          try {
            await api.post('/role-function-modules/', pl)
            ok = true
            break
          } catch (e) {
            // try next
          }
        }
        if (!ok) console.warn('[AdminPanel] rfmc create failed for fmc', fid)
      }
    }

    showToast('success','Tamam','Rol oluşturuldu ve FMC atandı')
    showCreateRole.value = false
    newRole.value = { name:'', detail:'' }
    selectedFmcIds.value = []
    await loadRoles()
    await loadRoleUsers()
  } catch (err) {
    console.error(err)
    showToast('error','Hata','Rol oluşturulamadı veya FMC ataması başarısız')
  } finally {
    loading.value.createRole = false
  }
}

/* delete role unchanged */
async function deleteRole(role) {
  const rid = roleIdOf(role)
  if (!rid) { showToast('warn','Uyarı','Silinecek rol ID yok'); return }
  try {
    await api.delete(`/roles/${rid}/`)
    showToast('success','Silindi','Rol silindi')
    if (selectedRole.value && roleIdOf(selectedRole.value) === rid) { selectedRole.value = null; roleDetailGrouped.value = [] }
    await loadRoles(); await loadRoleUsers()
  } catch (err) {
    showToast('error','Hata','Rol silinemedi'); console.error(err)
  }
}
function confirmDeleteRole(r) { if (!confirm(`"${roleNameOf(r)}" rolünü silmek istediğinize emin misiniz?`)) return; deleteRole(r) }
function selectRole(r) { selectedRole.value = r; loadRoleDetail(roleIdOf(r)) }

/* ASSIGN FLOW: openAssignDialog güncel roleUsers yüklemesi yapar */
async function openAssignDialog(user) {
  try {
    activeUser.value = user
    assignRoleId.value = null
    assignRoleDetail.value = []

    // güncel role-user mapping'i yükle (böylece rolesAssignable doğru hesaplanır)
    await loadRoleUsers()

    if (!roles.value || roles.value.length === 0) await loadRoles()
    showAssignDialog.value = true
  } catch (err) {
    console.error(err)
    showToast('warn', 'Hata', 'Roller veya atama verileri yüklenemedi')
    showAssignDialog.value = true
  }
}

async function assignRoleToUserWithRole(roleOrId) {
  if (!activeUser.value || !roleOrId) { showToast('warn','Uyarı','Kullanıcı veya rol seçili değil'); return }
  loading.value.assign = true

  // normalize role id + user id
  const rid = Number(typeof roleOrId === 'object' ? roleIdOf(roleOrId) : roleOrId)
  const uid = userIdOf(activeUser.value)
  if (!rid || !uid) {
    showToast('warn','Uyarı','Geçersiz kullanıcı veya rol ID')
    loading.value.assign = false
    return
  }

  // farklı backend beklentilerine karşı çeşitli payload formatları
  const payloadCandidates = [
    { user: uid, role: rid },
    { user_id: uid, role_id: rid },
    { user: { id: uid }, role: rid },
    { user: uid, role_id: rid },
    { user_id: uid, role: rid },
    { user: activeUser.value, role: rid },
    { user: { user_id: uid }, role_id: rid }
  ]

  let ok = false
  const validationMessages = [] // 400'lerden gelen detaylar

  for (const payload of payloadCandidates) {
    try {
      const resp = await api.post('/role-user/', payload)
      // başarılı ise döngüyü bitir
      ok = true
      break
    } catch (err) {
      const status = err?.response?.status
      const data = err?.response?.data

      // validation hatası (400) -> kullanıcıya okunaklı mesaj hazırlamak için kaydet
      if (status === 400 && data) {
        if (typeof data === 'string') {
          validationMessages.push(data)
        } else if (typeof data === 'object') {
          // örnek: { "user": ["Bu alan zorunlu."], "role": ["Bu alan zorunlu."] }
          Object.keys(data).forEach(k => {
            const v = data[k]
            if (Array.isArray(v)) validationMessages.push(`${k}: ${v.join(' | ')}`)
            else validationMessages.push(`${k}: ${String(v)}`)
          })
        } else {
          validationMessages.push(JSON.stringify(data))
        }
        // 400 döndüğünde diğer payload'lar bazen farklı davranabilir; biz yine denemeye devam edelim
        // (ancak eğer backend hep aynı formatı istiyorsa en sonunda bu mesaj gösterilecek)
      } else if (status && status >= 400 && status < 500 && data) {
        // diğer client hataları (örn 401/403/409 vb.) kısa göster
        const pretty = typeof data === 'string' ? data : (data.detail ?? JSON.stringify(data))
        validationMessages.push(`Hata ${status}: ${pretty}`)
      } else {
        // network veya sunucu tarafı; logla ve diğer payload'ı denemeye devam et
        console.warn('[assign] payload attempt failed, trying next', payload, err)
      }
    }
  }

  if (ok) {
    showToast('success','Tamam','Rol atandı')
    await loadRoleUsers()
    await loadUsers()
    showAssignDialog.value = false
  } else {
    // Eğer validationMessages varsa onları göster; yoksa genel hata göster
    if (validationMessages.length > 0) {
      // kısa ve okunaklı birleştirme
      const msg = validationMessages.join(' — ')
      showToast('warn', 'Atama doğrulama hatası (400)', msg)
    } else {
      showToast('error','Hata','Rol atama başarısız. Backend veya ağ sorununu kontrol edin.')
      console.error('[AdminPanel] All assign attempts failed for user', uid, 'role', rid)
    }
  }

  loading.value.assign = false
}
/* remove role assignment */
async function removeUserRole(r) {
  if (!activeUser.value || !r) return
  const uid = userIdOf(activeUser.value)
  const rid = roleIdOf(r)
  const found = roleUsers.value.find(x => {
    const xu = x.user ?? x.user_id ?? x.userId
    const xr = x.role ?? x.role_id ?? x.roleId
    const userMatches = (typeof xu === 'object' && xu !== null) ? ((xu.id ?? xu.user_id) === uid) : (xu === uid)
    const roleMatches = (typeof xr === 'object' && xr !== null) ? ((xr.role_id ?? xr.id) === rid) : (xr === rid)
    return userMatches && roleMatches
  })
  if (!found) { showToast('warn','Uyarı','Atama bulunamadı'); return }
  if (!confirm(`"${roleNameOf(r)}" rolünü kullanıcıdan kaldırmak istediğinize emin misiniz?`)) return
  try {
    const ruc = found.ruc_id ?? found.id ?? found.rucId ?? null
    await api.delete(`/role-user/${ruc}/`)
    showToast('success','Kaldırıldı','Rol ataması kaldırıldı')
    await loadRoleUsers(); await loadUsers()
  } catch (err) {
    console.error(err); showToast('error','Hata','Rol ataması kaldırılamadı')
  }
}

function selectUser(u) { activeUser.value = u; showAssignDialog.value = true }
function getUserRoles(user) {
  if (!user) return []
  const uid = userIdOf(user)
  const assigned = roleUsers.value.filter(x => {
    const xu = x.user ?? x.user_id ?? x.userId ?? null
    if (typeof xu === 'object' && xu !== null) return (xu.id ?? xu.user_id ?? xu.pk) === uid
    return xu === uid
  })
  return assigned.map(a => {
    const r = a.role ?? a.role_obj ?? a.role_id ?? a.roleId
    if (typeof r === 'object' && r !== null) return r
    return roles.value.find(rr => roleIdOf(rr) === (a.role_id ?? a.role ?? a.roleId)) || { role_name: String(a.role ?? a.role_id) }
  })
}

/* --- Edit-Dialog helpers --- */

/* Open Edit FMC dialog: load function-modules and current rfmc rows for role */
async function openEditRoleFMCs(role) {
  try {
    selectedRole.value = role
    editSelectedFmcIds.value = []
    existingRoleRfmcRows = {}
    editRoleDetail.value = role?.role_detail ?? role?.detail ?? ''

    const rid = roleIdOf(role)
    if (!rid) {
      showToast('warn','Uyarı','Rol ID yok')
      return
    }

    // ensure FMC list available
    if (!functionModules.value || functionModules.value.length === 0) {
      await loadFunctionModules()
    }

    // load rfmc rows for this role to know current assignments and rfmc ids for deletion
    loading.value.roleDetail = true
    const rfmcRes = await api.get('/role-function-modules/', { params: { role_id: rid } }).catch(e => e?.response ? e.response : null)
    const rfmcRaw = Array.isArray(rfmcRes?.data) ? rfmcRes.data : (rfmcRes?.data?.results ? rfmcRes.data.results : [])
    const rfmcList = (rfmcRaw || []).filter(r => {
      const rv = r.role ?? r.role_id ?? r.roleId ?? null
      if (rv == null) return false
      if (typeof rv === 'object') {
        return Number(rv.role_id ?? rv.id ?? rv.pk ?? rv) === Number(rid)
      } else {
        return Number(rv) === Number(rid)
      }
    })

    // populate map: fmc_id -> rfmcRowId
    rfmcList.forEach(r => {
      const fid = Number(r.fmc ?? r.fmc_id ?? (r.fmc_detail && (r.fmc_detail.fmc_id ?? r.fmc_detail.fmc)) ?? null)
      const ridRow = r.rfmc_id ?? r.id ?? r.pk ?? null
      if (fid) {
        existingRoleRfmcRows[fid] = ridRow
      }
    })

    // preselect FMCs for the role
    editSelectedFmcIds.value = Object.keys(existingRoleRfmcRows).map(x => Number(x))

    showEditRoleFmc.value = true
  } catch (err) {
    console.error(err)
    showToast('error','Hata','Rol FMC verileri yüklenemedi')
  } finally {
    loading.value.roleDetail = false
  }
}

/* toggle select all within edit dialog for a module group */
function isEditModuleFullySelected(group) {
  const ids = group.items.map(i => Number(i.fmc_id))
  return ids.every(id => editSelectedFmcIds.value.includes(id))
}
function toggleEditModule(group) {
  const ids = group.items.map(i => Number(i.fmc_id))
  if (isEditModuleFullySelected(group)) {
    editSelectedFmcIds.value = editSelectedFmcIds.value.filter(id => !ids.includes(Number(id)))
  } else {
    const newSet = new Set(editSelectedFmcIds.value.map(Number))
    ids.forEach(i => newSet.add(i))
    editSelectedFmcIds.value = Array.from(newSet)
  }
}

/* Save updates: create new rfmc for added ids, delete rfmc rows for removed ids */
async function saveRoleFmcUpdates() {
  if (!selectedRole.value) { showToast('warn','Uyarı','Rol seçili değil'); return }
  loading.value.createRole = true
  try {
    const rid = roleIdOf(selectedRole.value)
    // compute existing & desired sets
    const existingIds = new Set(Object.keys(existingRoleRfmcRows).map(x => Number(x)))
    const desiredIds = new Set((editSelectedFmcIds.value || []).map(x => Number(x)).filter(Boolean))

    const toAdd = Array.from(desiredIds).filter(x => !existingIds.has(x))
    const toRemove = Array.from(existingIds).filter(x => !desiredIds.has(x))

    // 1) create new mappings
    for (const fid of toAdd) {
      const payloadCandidates = [
        { role: rid, fmc: fid },
        { role_id: rid, fmc_id: fid },
        { role: rid, fmc_id: fid },
        { role_id: rid, fmc: fid }
      ]
      let ok = false
      for (const pl of payloadCandidates) {
        try {
          await api.post('/role-function-modules/', pl)
          ok = true
          break
        } catch (e) {
          // try next
        }
      }
      if (!ok) console.warn('[EditFMC] create failed for', fid)
    }

    // 2) delete removed mappings (use stored rfmc row ids)
    for (const fid of toRemove) {
      const rowId = existingRoleRfmcRows[fid]
      if (!rowId) {
        console.warn('[EditFMC] missing rfmc row id for removal of fmc', fid)
        continue
      }
      try {
        await api.delete(`/role-function-modules/${rowId}/`)
      } catch (err) {
        console.warn('[EditFMC] delete failed for rfmc row', rowId, err)
      }
    }

    // Optionally update role detail if edited (try best-effort patch)
    if (String(editRoleDetail.value || '').trim() !== String(selectedRole.value?.role_detail || selectedRole.value?.detail || '')) {
      try {
        await api.patch(`/roles/${rid}/`, { role_detail: editRoleDetail.value })
      } catch (err) {
        // ignore patch failure but log
        console.warn('[EditFMC] role detail patch failed', err)
      }
    }

    showToast('success','Tamam','Rolün FMCleri güncellendi')
    showEditRoleFmc.value = false
    // reload fresh data
    await loadRoleUsers()
    await loadFunctionModules()
    await loadRoles()
    await loadRoleDetail(rid)
  } catch (err) {
    console.error(err)
    showToast('error','Hata','Güncelleme başarısız oldu')
  } finally {
    loading.value.createRole = false
  }
}

/* UI helpers for module selection (create dialog) */
function isModuleFullySelected(group) {
  const ids = group.items.map(i => Number(i.fmc_id))
  return ids.every(id => selectedFmcIds.value.includes(id))
}
function toggleSelectModule(group) {
  const ids = group.items.map(i => Number(i.fmc_id))
  if (isModuleFullySelected(group)) {
    selectedFmcIds.value = selectedFmcIds.value.filter(id => !ids.includes(Number(id)))
  } else {
    // add those not present
    const newSet = new Set(selectedFmcIds.value.map(Number))
    ids.forEach(i => newSet.add(i))
    selectedFmcIds.value = Array.from(newSet)
  }
}

/* open create dialog (ensure FMCs loaded) */
async function openCreateRole() {
  if (!functionModules.value || functionModules.value.length === 0) {
    await loadFunctionModules()
  }
  selectedFmcIds.value = []
  fmcSearch.value = ''
  showCreateRole.value = true
}

/* init */
onMounted(() => {
  loadAll()
})
</script>

<style scoped>
/* --------- New layout styles (colors preserved) ---------- */

.admin-shell {
  max-width: 1200px;
  margin: 18px auto;
  padding: 12px;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  color: #0f172a;
}

/* header */
.admin-header {
  display:grid;
  grid-template-columns: 1fr 560px 260px;
  gap:12px;
  align-items:center;
  padding:12px;
  border-radius:10px;
  background: linear-gradient(90deg, rgba(99,102,241,0.06), rgba(139,92,246,0.03));
  border:1px solid rgba(15,23,42,0.03);
}
.header-left { display:flex; align-items:center; gap:10px; }
.brand-logo { width:36px; height:36px; fill:#6366f1; }
.brand-text h1 { margin:0; font-size:16px; }
.subtitle { margin:0; font-size:12px; color:#6b7280; }

.header-center { display:flex; justify-content:center; }
.header-right { display:flex; justify-content:flex-end; gap:8px; align-items:center; }

/* search */
.search-wrap { display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:999px; background:#fff; border:1px solid #eef2ff; min-width:360px; }
.search-wrap input { border:0; outline:none; width:420px; background:transparent; }

/* main grid: roles left, users right */
.admin-grid {
  display:grid;
  grid-template-columns: 300px 1fr;
  gap:16px;
  margin-top:14px;
}

/* cards */
.card { background:#fff; border-radius:10px; padding:10px; border:1px solid rgba(15,23,42,0.03); box-shadow: 0 6px 18px rgba(2,6,23,0.03); }

/* roles column */
.col-roles { display:flex; flex-direction:column; min-height: calc(100vh - 180px); max-height: calc(100vh - 140px); }
.roles-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.roles-list-wrap { overflow:auto; padding-right:6px; }

/* role entries */
.roles-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px; }
.role-entry { display:flex; justify-content:space-between; align-items:center; padding:8px; border-radius:8px; cursor:pointer; border:1px solid rgba(15,23,42,0.02); background:transparent; transition:all .12s ease; }
.role-entry:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(2,6,23,0.04); }
.role-entry.selected { background: linear-gradient(90deg, rgba(99,102,241,0.04), rgba(139,92,246,0.02)); border-color: rgba(99,102,241,0.1); }
.role-entry-left { display:flex; gap:8px; align-items:center; }
.role-avatar { width:40px; height:40px; border-radius:8px; background: linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; }
.role-meta .role-name { font-weight:800; }

/* selected role small box */
.selected-role-box { margin-top:10px; padding:10px; border-radius:8px; background:#fafafa; border:1px solid rgba(15,23,42,0.02); overflow:auto; }
.selected-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.selected-role-name { font-weight:800; }

/* module details */
.module-details { margin-bottom:8px; border-radius:8px; padding:6px; background:#fff; border:1px solid rgba(15,23,42,0.02); }
.module-details > summary { display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-weight:700; padding:6px; list-style:none; }
.module-funcs { margin-top:8px; display:flex; flex-direction:column; gap:6px; }
.func-line { display:flex; justify-content:space-between; align-items:center; padding:6px; border-radius:6px; background: linear-gradient(180deg,#fff,#fbfdff); border:1px solid rgba(15,23,42,0.02); }

/* users column */
.col-users { display:flex; flex-direction:column; min-height: calc(100vh - 180px); max-height: calc(100vh - 140px); overflow:hidden; }
.users-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.users-grid-wrap { overflow:auto; padding-right:6px; }

/* users grid: responsive cards */
.users-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap:12px; align-items:start; }
.user-card { display:flex; flex-direction:column; justify-content:space-between; padding:12px; border-radius:10px; border:1px solid rgba(15,23,42,0.03); background:#fff; cursor:pointer; transition:all .12s ease; }
.user-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(2,6,23,0.05); }

.user-card-top { display:flex; gap:12px; align-items:center; }
.avatar { width:48px; height:48px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:800; color:#fff; background: linear-gradient(135deg,#06b6d4,#7c3aed); }
.user-info .name { font-weight:700; }
.user-card-bottom { display:flex; justify-content:space-between; align-items:center; margin-top:10px; gap:8px; }
.user-roles { display:flex; gap:6px; align-items:center; flex-wrap:wrap; }
.chip.tiny { padding:4px 8px; font-size:12px; border-radius:999px; background:#eef2ff; color:#1e3a8a; }

/* actions */
.user-actions { display:flex; gap:6px; align-items:center; }

/* floating create button */
.floating-create { position: fixed; right:22px; bottom:22px; z-index:60; }
.select-all-btn{border-radius: 12px;
    background: linear-gradient(135deg, #06b6d4, #7c3aed);
    color: #fff; padding:6px 10px; border:0; cursor:pointer;}
/* pagination */
.pagination-wrap { display:flex; justify-content:center; align-items:center; gap:8px; margin-top:12px; }
.pg-btn { border:1px solid rgba(15,23,42,0.06); padding:6px 10px; border-radius:6px; background:#fff; cursor:pointer; }
.pg-btn:disabled { opacity:0.5; cursor:not-allowed; }
.pg-info { font-size:13px; color:#374151; }

/* assign/create dialog styling */
/* <<< UPDATED: dialog background uses requested gradient, interior panels are semi-opaque & harmonized >>> */
.create-dialog {
  display:flex;
  gap:12px;
  align-items:flex-start;
  padding:12px;
  border-radius:12px;
  /* requested strong gradient */
  background: linear-gradient(135deg, #06b6d4, #7c3aed);
  color: #fff;
  box-shadow: 0 12px 40px rgba(2,6,23,0.14);
}

/* inner panels: translucent white so they read well but blend with the gradient */
.create-left {
  flex:1;
  background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.90));
  color:#0f172a;
  padding:14px;
  border-radius:10px;
  border:1px solid rgba(255,255,255,0.6);
  backdrop-filter: blur(6px);
  box-shadow: 0 8px 24px rgba(2,6,23,0.06);
}

/* right pane: same translucent card (scrollable for FMC list) */
.create-right {
  width:420px;
  max-height:480px;
  overflow:auto;
  padding:14px;
  border-radius:10px;
  background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.92));
  color:#0f172a;
  border:1px solid rgba(255,255,255,0.6);
  backdrop-filter: blur(6px);
  box-shadow: 0 8px 24px rgba(2,6,23,0.06);
}

/* input styling inside create dialog */
.create-left .p-inputtext,
.create-left .p-inputtextarea,
.create-right .fmc-search,
.create-left .input-large {
  width:100%;
  padding:10px;
  border-radius:8px;
  border:1px solid rgba(15,23,42,0.06);
  box-shadow:none;
  font-size:14px;
  background: #fff;
}


/* style checkboxes / fmc items */
.fmc-module-group { margin-bottom:10px; padding:8px; border-radius:8px; background:#fff; border:1px solid rgba(15,23,42,0.03); }
.fmc-items { display:flex; flex-wrap:wrap; gap:8px; }

/* assign wrap special: requested gradient background with inner translucent cards */
.assign-wrap {
  display:flex;
  gap:16px;
  align-items:flex-start;
  padding:16px;
  border-radius:12px;
  background: linear-gradient(135deg, #06b6d4, #7c3aed);
  color: #fff;
  box-shadow: 0 12px 36px rgba(2,6,23,0.14);
}

/* user info card: slightly translucent white for harmony */
.white-card {
  background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.94));
  border-radius:10px;
  padding:14px;
  border:1px solid rgba(255,255,255,0.6);
  box-shadow: 0 10px 28px rgba(2,6,23,0.06);
  color:#0f172a;
  min-width:280px;
}

/* assign-right area: role list lives in translucent cards for readability */
.assign-right { flex:1; display:flex; flex-direction:column; }
.assign-list-card { background:transparent; max-height:420px; overflow:auto; padding-right:6px; }

/* each assign-row card */
.assign-row { display:flex; justify-content:space-between; align-items:center; padding:10px; border-radius:8px; margin-bottom:8px; }
.white-row {
  background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.94));
  border:1px solid rgba(255,255,255,0.5);
  box-shadow: 0 8px 18px rgba(2,6,23,0.06);
  color:#0f172a;
}
.assign-meta .assign-name { font-weight:700; }

/* styled assign-button: gradient to match dialog, white label, small shadow */
.styled-pbtn {
  min-width:84px;
  background: linear-gradient(90deg, #06b6d4, #7c3aed) !important;
  color: #fff !important;
  border: 0 !important;
  box-shadow: 0 8px 18px rgba(124,58,237,0.12);
  transition: transform .12s ease, box-shadow .12s ease;
}
.styled-pbtn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 26px rgba(124,58,237,0.16);
}

/* PrimeVue text/button adjustments (to ensure contrast on gradient header/footer) */
.create-dialog .p-button-text,
.assign-wrap .p-button-text {
  color: #0f172a !important;
  background: transparent !important;
  border: none !important;
}

/* ensure primary buttons inside create dialog are visible and consistent */
.create-dialog .p-button,
.assign-wrap .p-button {
  border-radius:8px;
}

/* subtle hover for white cards inside dialogs */
.create-left:hover, .create-right:hover, .white-card:hover, .white-row:hover {
  transform: translateY(-3px);
  transition: transform .12s ease;
}

/* small tweaks for inputs/buttons inside dialogs */
.create-left .label { color:#111 !important; font-weight:700; margin-bottom:6px; display:block; }

/* small utilities */
.muted { color:#6b7280; }
.small { font-size:12px; }
.tiny { font-size:11px; }
.ellipsis { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.remove-small { background:transparent; border:0; color:#ef4444; font-weight:700; cursor:pointer; padding:0 6px; }

/* responsive */
@media (max-width: 1100px) {
  .admin-header { grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; }
  .header-center { order:3; grid-column: 1 / -1; justify-content:flex-start; }
  .admin-grid { grid-template-columns: 1fr; }
  .col-roles { order:2; max-height: 300px; }
  .col-users { order:1; max-height: unset; }
  .search-wrap input { width:240px; }
  .header-right { justify-content:flex-start; }
}
</style>
