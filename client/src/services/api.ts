// Configuração centralizada da API

import * as sessionManager from './sessionManager';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const API_CONFIG = {
  BASE_URL: BASE_URL
}

// Interface genérica para respostas da API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Cliente API simples usando a instância centralizada do axios
export const api = {
  get: async <T = any>(endpoint: string, options?: any) => {
    const response = await axio_api.get<T>(endpoint, options);
    return response.data;
  },

  post: async <T = any>(endpoint: string, body?: unknown, options?: any) => {
    const response = await axio_api.post<T>(endpoint, body, options);
    return response.data;
  },

  put: async <T = any>(endpoint: string, body?: unknown, options?: any) => {
    const response = await axio_api.put<T>(endpoint, body, options);
    return response.data;
  },

  patch: async <T = any>(endpoint: string, body?: unknown, options?: any) => {
    const response = await axio_api.patch<T>(endpoint, body, options);
    return response.data;
  },

  delete: async <T = any>(endpoint: string, options?: any) => {
    const response = await axio_api.delete<T>(endpoint, options);
    return response.data;
  },
};

export default api;

// Criar instância do axios com configuração base
export const axio_api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 60000, // Aumentado para 60 segundos por segurança
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests (Axios)
axio_api.interceptors.request.use(
  (config) => {
    const token = sessionManager.SessionManager.getToken();
    const orgId = sessionManager.SessionManager.getOrgId();
    const user = sessionManager.SessionManager.getUser();
    const env = sessionManager.SessionManager.getEnvironment();

    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (orgId) config.headers['x-organization-id'] = orgId;
    if (user?.id) config.headers['x-user-id'] = user.id;
    config.headers['x-use-trial'] = env === 'trial' ? 'true' : 'false';

    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para responses (Axios)
axio_api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🚪 Não autorizado (401). Limpando sessão...');
      sessionManager.SessionManager.clearSession();
    }

    // Melhorar a mensagem de erro do Axios
    if (error.response?.data?.error) {
      error.message = error.response.data.error;
    } else if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }

    return Promise.reject(error);
  }
);
