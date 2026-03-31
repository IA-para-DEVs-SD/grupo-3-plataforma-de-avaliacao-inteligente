// Testes de integração para as rotas de autenticação
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';

// Mock do auth-service para isolar os testes de rota
jest.unstable_mockModule('../services/auth-service.js', () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  logoutUser: jest.fn(),
  isTokenBlacklisted: jest.fn().mockReturnValue(false),
  verifyToken: jest.fn(),
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  generateToken: jest.fn(),
}));

const { registerUser, loginUser, logoutUser } = await import('../services/auth-service.js');
const { default: app } = await import('../server.js');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/auth/register', () => {
  test('deve retornar 201 ao registrar com dados válidos', async () => {
    const mockUser = { id: '1', name: 'Maria', email: 'maria@email.com' };
    const mockToken = 'jwt-token-register';
    registerUser.mockResolvedValue({ user: mockUser, token: mockToken });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Maria', email: 'maria@email.com', password: 'senha1234' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ user: mockUser, token: mockToken });
    expect(registerUser).toHaveBeenCalledWith({
      name: 'Maria',
      email: 'maria@email.com',
      password: 'senha1234',
    });
  });
});

describe('POST /api/auth/login', () => {
  test('deve retornar 200 ao fazer login com credenciais válidas', async () => {
    const mockUser = { id: '1', name: 'Maria', email: 'maria@email.com' };
    const mockToken = 'jwt-token-login';
    loginUser.mockResolvedValue({ user: mockUser, token: mockToken });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'maria@email.com', password: 'senha1234' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user: mockUser, token: mockToken });
    expect(loginUser).toHaveBeenCalledWith({
      email: 'maria@email.com',
      password: 'senha1234',
    });
  });
});

describe('POST /api/auth/logout', () => {
  test('deve retornar 200 ao fazer logout com token Bearer', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', 'Bearer meu-token-jwt');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Logout realizado com sucesso' });
    expect(logoutUser).toHaveBeenCalledWith('meu-token-jwt');
  });
});
