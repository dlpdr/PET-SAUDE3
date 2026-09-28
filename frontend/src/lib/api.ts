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
