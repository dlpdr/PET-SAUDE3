import axios, { type InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// O Route Handler /api encaminha as requisições pelo mesmo domínio do frontend.
const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injetar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let refreshRequest: Promise<string> | null = null;
function clearSession() {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
  Cookies.remove('user_role');
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth-change'));
}
api.interceptors.response.use(response => response, async error => {
  const request = error.config as (InternalAxiosRequestConfig & { retried?: boolean }) | undefined;
  const publicAuth = ['/auth/login/', '/auth/register/', '/auth/google/', '/auth/refresh/', '/auth/confirm-email/', '/auth/resend-confirmation/', '/auth/request-password-reset/', '/auth/reset-password/'];
  if (error.response?.status !== 401 || !request || publicAuth.includes(request.url || '')) {
    return Promise.reject(error);
  }
  if (request.retried) {
    if (request.headers.Authorization === `Bearer ${Cookies.get('access_token')}`) clearSession();
    return Promise.reject(error);
  }
  request.retried = true;
  const refresh = Cookies.get('refresh_token');
  if (refresh) {
    try {
      if (!refreshRequest) {
        refreshRequest = axios.post<{ access: string }>('/api/auth/refresh/', { refresh })
          .then(response => {
            if (Cookies.get('refresh_token') !== refresh) throw new Error('Sessão encerrada.');
            Cookies.set('access_token', response.data.access, { expires: 1, sameSite: 'lax', secure: window.location.protocol === 'https:' });
            return response.data.access;
          }).finally(() => { refreshRequest = null; });
      }
      request.headers.Authorization = `Bearer ${await refreshRequest}`;
      return api(request);
    } catch (refreshError) {
      // A network outage should not erase a valid refresh token.
      if (axios.isAxiosError(refreshError) && ![400, 401, 403].includes(refreshError.response?.status || 0)) {
        return Promise.reject(refreshError);
      }
    }
  }
  if (refresh && Cookies.get('refresh_token') !== refresh) return Promise.reject(error);
  clearSession();
  // Public pages remain usable after a session expires.
  if (request.method === 'get' && request.url?.startsWith('/publications/') && !request.url.includes('/manage/')) {
    delete request.headers.Authorization;
    return api(request);
  }
  return Promise.reject(error);
});

export default api;

export function getApiErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

export function getApiErrorMessage(
  error: unknown,
  fallback: string,
  preferredFields: string[] = [],
): string {
  if (!axios.isAxiosError(error)) return fallback;

  const data: unknown = error.response?.data;
  if (!data || typeof data !== "object") return fallback;

  const fields = data as Record<string, unknown>;
  for (const field of [...preferredFields, "detail"]) {
    const value = fields[field];
    if (typeof value === "string" && value.trim()) return value;
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  }

  return fallback;
}

/**
 * Encaminha uploads pelo proxy /media para preservar o HTTPS do frontend.
 * Imagens externas são aceitas somente com HTTPS.
 */
export function getMediaUrl(relativeUrl: string | null | undefined): string | null {
  if (!relativeUrl) return null;
  try {
    const url = new URL(relativeUrl, 'https://media.local/');
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    // Backend uploads always travel through our HTTPS origin.
    if (url.pathname.startsWith('/media/')) return `${url.pathname}${url.search}`;
    return url.protocol === 'https:' && url.hostname !== 'media.local' ? url.href : null;
  } catch {
    return null;
  }
}
