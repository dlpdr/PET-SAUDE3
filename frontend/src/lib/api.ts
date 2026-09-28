import axios from 'axios';
import Cookies from 'js-cookie';

// Usamos um proxy do Next.js configurado no next.config.ts para evitar erros de CORS e Mixed Content (HTTPS -> HTTP)
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

export default api;

/**
 * Converte URLs relativas de mídia (ex: /media/publications/foto.jpg)
 * em URLs absolutas apontando para o servidor AWS.
 * Necessário porque o Vercel (HTTPS) não consegue resolver URLs relativas do backend (HTTP).
 */
export function getMediaUrl(relativeUrl: string | null | undefined): string | null {
  if (!relativeUrl) return null;
  if (relativeUrl.startsWith('http')) return relativeUrl;
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://18.117.173.196/api').replace('/api', '');
  return base + relativeUrl;
}
