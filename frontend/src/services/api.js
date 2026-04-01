import axios from 'axios';

// URL base da API — usa variável de ambiente ou fallback para localhost
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Instância axios configurada para comunicação com o backend.
 * Inclui interceptors para autenticação JWT e tratamento de erros.
 */
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de requisição — injeta o token JWT no header Authorization.
 * Lê o token do localStorage a cada requisição para garantir que está atualizado.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Interceptor de resposta — trata erros de autenticação (401).
 * Remove o token inválido e redireciona para a página de login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
