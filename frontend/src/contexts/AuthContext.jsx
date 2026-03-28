import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';

// Contexto de autenticação — gerencia estado do usuário, login, registro e logout
const AuthContext = createContext(null);

/**
 * Provider de autenticação.
 * Gerencia o estado do usuário autenticado, verifica token existente no mount,
 * e fornece funções de login, registro e logout para os componentes filhos.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verifica se existe token e dados do usuário no localStorage ao montar
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Dados corrompidos no localStorage — limpa tudo
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  /**
   * Realiza login com e-mail e senha.
   * Armazena token e dados do usuário no localStorage.
   */
  const login = useCallback(async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user: userData } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    return response.data;
  }, []);

  /**
   * Registra um novo usuário com nome, e-mail e senha.
   * Armazena token e dados do usuário no localStorage após cadastro.
   */
  const register = useCallback(async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    const { token, user: userData } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    return response.data;
  }, []);

  /**
   * Realiza logout do usuário.
   * Remove token e dados do localStorage e limpa o estado.
   */
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      // Limpa estado local independente do resultado da chamada à API
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  const isAuthenticated = !!user;

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acessar o contexto de autenticação.
 * Deve ser usado dentro de um AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export default AuthContext;
