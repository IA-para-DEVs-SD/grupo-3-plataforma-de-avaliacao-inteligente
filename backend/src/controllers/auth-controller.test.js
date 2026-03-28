// Testes unitários para o controller de autenticação
import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock do auth-service — deve ser declarado ANTES de importar o controller
jest.unstable_mockModule('../services/auth-service.js', () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  logoutUser: jest.fn(),
}));

// Importa o controller e o serviço mockado após declarar o mock
const { register, login, logout } = await import('./auth-controller.js');
const { registerUser, loginUser, logoutUser } = await import('../services/auth-service.js');

/**
 * Cria um mock de requisição Express com body e headers.
 */
function createMockReq({ body = {}, headers = {} } = {}) {
  return { body, headers };
}

/**
 * Cria um mock de resposta Express para capturar status e JSON.
 */
function createMockRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(data) {
      res.body = data;
      return res;
    },
  };
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('register', () => {
  test('deve retornar 201 com user e token ao registrar com sucesso', async () => {
    const mockUser = { id: '123', name: 'João', email: 'joao@email.com' };
    const mockToken = 'jwt-token-abc';
    registerUser.mockResolvedValue({ user: mockUser, token: mockToken });

    const req = createMockReq({ body: { name: 'João', email: 'joao@email.com', password: 'senha1234' } });
    const res = createMockRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(registerUser).toHaveBeenCalledWith({ name: 'João', email: 'joao@email.com', password: 'senha1234' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ user: mockUser, token: mockToken });
    expect(next).not.toHaveBeenCalled();
  });

  test('deve chamar next com erro quando registerUser lança exceção', async () => {
    const error = new Error('E-mail já em uso');
    error.code = 'EMAIL_ALREADY_EXISTS';
    registerUser.mockRejectedValue(error);

    const req = createMockReq({ body: { name: 'João', email: 'joao@email.com', password: 'senha1234' } });
    const res = createMockRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.statusCode).toBeNull();
  });
});

describe('login', () => {
  test('deve retornar 200 com user e token ao fazer login com sucesso', async () => {
    const mockUser = { id: '123', name: 'João', email: 'joao@email.com' };
    const mockToken = 'jwt-token-xyz';
    loginUser.mockResolvedValue({ user: mockUser, token: mockToken });

    const req = createMockReq({ body: { email: 'joao@email.com', password: 'senha1234' } });
    const res = createMockRes();
    const next = jest.fn();

    await login(req, res, next);

    expect(loginUser).toHaveBeenCalledWith({ email: 'joao@email.com', password: 'senha1234' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ user: mockUser, token: mockToken });
    expect(next).not.toHaveBeenCalled();
  });

  test('deve chamar next com erro quando loginUser lança exceção', async () => {
    const error = new Error('Credenciais inválidas');
    error.code = 'INVALID_CREDENTIALS';
    loginUser.mockRejectedValue(error);

    const req = createMockReq({ body: { email: 'joao@email.com', password: 'errada' } });
    const res = createMockRes();
    const next = jest.fn();

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.statusCode).toBeNull();
  });
});

describe('logout', () => {
  test('deve retornar 200 com mensagem de sucesso ao fazer logout com Bearer token', async () => {
    const req = createMockReq({ headers: { authorization: 'Bearer meu-token-jwt' } });
    const res = createMockRes();
    const next = jest.fn();

    await logout(req, res, next);

    expect(logoutUser).toHaveBeenCalledWith('meu-token-jwt');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Logout realizado com sucesso' });
    expect(next).not.toHaveBeenCalled();
  });

  test('deve extrair token sem prefixo Bearer quando header não tem prefixo', async () => {
    const req = createMockReq({ headers: { authorization: 'token-direto' } });
    const res = createMockRes();
    const next = jest.fn();

    await logout(req, res, next);

    expect(logoutUser).toHaveBeenCalledWith('token-direto');
    expect(res.statusCode).toBe(200);
  });

  test('deve chamar logoutUser com undefined quando não há header authorization', async () => {
    const req = createMockReq({ headers: {} });
    const res = createMockRes();
    const next = jest.fn();

    await logout(req, res, next);

    expect(logoutUser).toHaveBeenCalledWith(undefined);
    expect(res.statusCode).toBe(200);
  });

  test('deve chamar next com erro quando logoutUser lança exceção', async () => {
    const error = new Error('Falha inesperada');
    logoutUser.mockImplementation(() => { throw error; });

    const req = createMockReq({ headers: { authorization: 'Bearer token' } });
    const res = createMockRes();
    const next = jest.fn();

    await logout(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.statusCode).toBeNull();
  });
});
