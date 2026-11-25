import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Envia o token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Token inválido ou expirado: volta para o login
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const url = erro.config?.url || '';
    if (erro.response?.status === 401 && !url.startsWith('/auth')) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(erro);
  }
);

export const erroMsg = (erro) =>
  erro.response?.data?.erro || 'Não foi possível conectar à API. Ela está rodando?';

export default api;
