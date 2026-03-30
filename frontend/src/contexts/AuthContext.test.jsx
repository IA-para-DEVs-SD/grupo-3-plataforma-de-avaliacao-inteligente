import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext.jsx';

// Mock do módulo api
vi.mock('../services/api.js', () => ({
  default: {
    post: vi.fn(),
  },
}));

import api from '../services/api.js';

// Componente auxiliar para testar o hook useAuth
function TestConsumer() {
  const { user, loading, isAuthenticated, login, register, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user ? JSON.stringify(user) : 'null'}</span>
      <button data-testid="login-btn" onClick={() => login('test@email.com', 'senha1234').catch(() => {})} />
      <button data-testid="register-btn" onClick={() => register('João', 'joao@email.com', 'senha1234').catch(() => {})} />
      <button data-testid="logout-btn" onClick={() => logout().catch(() => {})} />
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve iniciar com usuário null e loading true, depois loading false', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
  });

  it('deve restaurar usuário do localStorage ao montar', async () => {
    const storedUser = { id: '1', name: 'Maria', email: 'maria@email.com' };
    localStorage.setItem('token', 'token-existente');
    localStorage.setItem('user', JSON.stringify(storedUser));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('user').textContent).toBe(JSON.stringify(storedUser));
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
  });

  it('deve limpar localStorage se dados do usuário estiverem corrompidos', async () => {
    localStorage.setItem('token', 'token-qualquer');
    localStorage.setItem('user', 'dados-invalidos{{{');

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('não deve restaurar usuário se token não existir no localStorage', async () => {
    localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Test' }));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('deve realizar login e armazenar dados no localStorage', async () => {
    const userData = { id: '2', name: 'Carlos', email: 'test@email.com' };
    api.post.mockResolvedValueOnce({
      data: { token: 'novo-token', user: userData },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@email.com',
      password: 'senha1234',
    });
    expect(localStorage.getItem('token')).toBe('novo-token');
    expect(localStorage.getItem('user')).toBe(JSON.stringify(userData));
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
  });

  it('deve realizar registro e armazenar dados no localStorage', async () => {
    const userData = { id: '3', name: 'João', email: 'joao@email.com' };
    api.post.mockResolvedValueOnce({
      data: { token: 'token-registro', user: userData },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    await act(async () => {
      screen.getByTestId('register-btn').click();
    });

    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      name: 'João',
      email: 'joao@email.com',
      password: 'senha1234',
    });
    expect(localStorage.getItem('token')).toBe('token-registro');
    expect(localStorage.getItem('user')).toBe(JSON.stringify(userData));
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
  });

  it('deve realizar logout e limpar localStorage', async () => {
    const userData = { id: '1', name: 'Ana', email: 'ana@email.com' };
    localStorage.setItem('token', 'token-ativo');
    localStorage.setItem('user', JSON.stringify(userData));
    api.post.mockResolvedValueOnce({});

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });

    await act(async () => {
      screen.getByTestId('logout-btn').click();
    });

    expect(api.post).toHaveBeenCalledWith('/auth/logout');
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
  });

  it('deve limpar estado local mesmo se a chamada de logout falhar', async () => {
    localStorage.setItem('token', 'token-ativo');
    localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Test' }));
    api.post.mockRejectedValueOnce(new Error('Erro de rede'));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });

    await act(async () => {
      screen.getByTestId('logout-btn').click();
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
  });

  it('deve lançar erro ao usar useAuth fora do AuthProvider', () => {
    // Suprime o erro do console esperado pelo React
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      'useAuth deve ser usado dentro de um AuthProvider'
    );

    consoleSpy.mockRestore();
  });
});
