// src/lib/api.js
import axios from "axios";

const RAW_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api/v1";
// temiz base: sondaki slash(lar) kalksın
const BASE_URL = RAW_BASE.replace(/\/+$/, "");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// localStorage anahtarları
const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  if (access) api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  delete api.defaults.headers.common["Authorization"];
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

// sayfa yüklenince varsa access header ekle (ilk yüklemede)
const token = getAccessToken();
if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

// Ensure each request has up-to-date Authorization header (in case tokens set after import)
api.interceptors.request.use((config) => {
  const t = getAccessToken();
  if (t) {
    config.headers = config.headers || {};
    // kullanıcının manuel olarak header eklediği durumlarda overwrite etme
    config.headers["Authorization"] = config.headers["Authorization"] || `Bearer ${t}`;
  }
  return config;
});

// refresh-on-401 interceptor (basit queue)
let isRefreshing = false;
let refreshQueue = [];

function processQueue(error, token = null) {
  refreshQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  refreshQueue = [];
}

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const originalRequest = error?.config;
    if (!originalRequest) return Promise.reject(error);

    const status = error.response?.status ?? null;

    // auth endpoint'lerinde refresh döngüsü yaratmamak için kontrol
    const url = (originalRequest.url || "").toString();
    const isAuthEndpoint =
      url.includes("/auth/token/refresh") ||
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/logout");

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      const refresh = getRefreshToken();
      if (!refresh) {
        clearTokens();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Eğer zaten refresh ediliyorsa, kuyrukla
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers["Authorization"] = "Bearer " + newToken;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        const resp = await axios.post(
          `${BASE_URL}/auth/token/refresh/`,
          { refresh },
          { headers: { "Content-Type": "application/json" } }
        );

        const newAccess = resp.data?.access;
        if (!newAccess) throw new Error("Refresh response has no access token");

        // update tokens + default header
        setTokens({ access: newAccess, refresh });
        processQueue(null, newAccess);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers["Authorization"] = "Bearer " + newAccess;
        return api(originalRequest);
      } catch (e) {
        processQueue(e, null);
        clearTokens();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    // diğer durumlarda hata olduğu gibi fırlat
    return Promise.reject(error);
  }
);

/**
 * Backend'e logout isteği atar (refresh gönderilir) ve her durumda client token'larını temizler.
 * ÖNEMLİ: burada axios kullanıyoruz; fakat Authorization header'ını manuel ekliyoruz
 * böylece backend LogoutView'ın IsAuthenticated kontrolü geçer.
 *
 * Davranış:
 * - Eğer refresh varsa önce /auth/logout/ (single logout, refresh body ile) çağrılır.
 * - Eğer bu çağrı 403/404/diğer beklenmeyen bir hata dönerse, fallback olarak /auth/logout/all/ denenir.
 * - Her durumda sonunda local token'lar temizlenir.
 */
export async function logoutBackend() {
  const refresh = getRefreshToken();
  const access = getAccessToken();
  const headers = { "Content-Type": "application/json" };
  if (access) headers["Authorization"] = `Bearer ${access}`;

  try {
    if (refresh) {
      // single logout (refresh gönder)
      await axios.post(
        `${BASE_URL}/auth/logout/`,
        { refresh },
        { headers }
      );
    }
  } catch (e) {
    // Eğer single logout başarısız olduysa (örn. permission/403), deneyelim logout all
    try {
      await axios.post(`${BASE_URL}/auth/logout/all/`, null, { headers });
    } catch (e2) {
      // ignore both errors; token'lar yine temizlenecek
    }
  } finally {
    clearTokens();
  }
}

export default api;
