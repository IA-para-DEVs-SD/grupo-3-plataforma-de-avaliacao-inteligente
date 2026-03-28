import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerUser, loginUser, logoutUser } from './auth-service.js';
import api from './api.js';

// Mock da instância axios para isolar testes do backend real
vi.mock('./api.js', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('auth-service.js — chamadas à API de autenticação', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    it('deve enviar POST /auth/register com nome, e-mail e senha', async () => {
      const mockData = { token: 'jwt-token', user: { id: '1', name: 'João', email: 'joao@email.com' } };
      api.post.mockResolvedValueOnce({ data: mockData });

      const result = await registerUser({ name: 'João', email: 'joao@email.com', password: 'senha12345' });

      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        name: 'João',
        email: 'joao@email.com',
        password: 'senha12345',
      });
      expect(result).toEqual(mockData);
    });

    it('deve propagar erro quando a API rejeita o cadastro', async () => {
      const error = new Error('E-mail já cadastrado');
      api.post.mockRejectedValueOnce(error);

      await expect(registerUser({ name: 'Ana', email: 'ana@email.com', password: 'senha12345' }))
        .rejects.toThrow('E-mail já cadastrado');
    });
  });

  describe('loginUser', () => {
    it('deve enviar POST /auth/login com e-mail e senha', async () => {
      const mockData = { token: 'jwt-token', user: { id: '1', email: 'joao@email.com' } };
      api.post.mockResolvedValueOnce({ data: mockData });

      const result = await loginUser({ email: 'joao@email.com', password: 'senha12345' });

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'joao@email.com',
        password: 'senha12345',
      });
      expect(result).toEqual(mockData);
    });

    it('deve propagar erro quando credenciais são inválidas', async () => {
      const error = new Error('Credenciais inválidas');
      api.post.mockRejectedValueOnce(error);

      await expect(loginUser({ email: 'joao@email.com', password: 'errada' }))
        .rejects.toThrow('Credenciais inválidas');
    });
  });

  describe('logoutUser', () => {
    it('deve enviar POST /auth/logout sem corpo', async () => {
      const mockData = { message: 'Logout realizado com sucesso' };
      api.post.mockResolvedValueOnce({ data: mockData });

      const result = await logoutUser();

      expect(api.post).toHaveBeenCalledWith('/auth/logout');
      expect(result).toEqual(mockData);
    });

    it('deve propagar erro quando logout falha', async () => {
      const error = new Error('Erro de rede');
      api.post.mockRejectedValueOnce(error);

      await expect(logoutUser()).rejects.toThrow('Erro de rede');
    });
  });
});
