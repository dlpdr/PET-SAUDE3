import axios from 'axios';
import Cookies from 'js-cookie';

// Tenta pegar a URL da variável de ambiente, se não houver, usa o IP da AWS
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://18.117.173.196/api';

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
