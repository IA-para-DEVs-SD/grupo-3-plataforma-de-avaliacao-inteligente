import api from './api.js';

/**
 * Serviço de autenticação — encapsula chamadas à API de auth
 * para reutilização em diferentes partes do frontend.
 */

/**
 * Registra um novo usuário na plataforma.
 * @param {{ name: string, email: string, password: string }} dados do cadastro
 * @returns {Promise<object>} dados da resposta (token + user)
 */
export async function registerUser({ name, email, password }) {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
}

/**
 * Realiza login com e-mail e senha.
 * @param {{ email: string, password: string }} credenciais
 * @returns {Promise<object>} dados da resposta (token + user)
 */
export async function loginUser({ email, password }) {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
}

/**
 * Realiza logout do usuário autenticado.
 * @returns {Promise<object>} dados da resposta
 */
export async function logoutUser() {
  const response = await api.post('/auth/logout');
  return response.data;
}
