// Testes unitários para o middleware de autenticação
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { AppError } from './error-middleware.js';

// Registra mocks ANTES de importar o middleware
const mockVerifyToken = jest.fn();
const mockIsTokenBlacklisted = jest.fn();
const mockFindById = jest.fn();

jest.unstable_mockModule('../services/auth-service.js', () => ({
  verifyToken: mockVerifyToken,
  isTokenBlacklisted: mockIsTokenBlacklisted,
}));

jest.unstable_mockModule('../models/user-model.js', () => ({
  findById: mockFindById,
}));

// Importa o middleware DEPOIS de registrar os mocks
const { authMiddleware } = await import('./auth-middleware.js');

/**
 * Cria um mock de requisição Express com header Authorization opcional.
 */
function createMockReq(authHeader) {
  return {
    headers: {
      ...(authHeader !== undefined ? { authorization: authHeader } : {}),
    },
    user: null,
  };
}

describe('authMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve injetar req.user e chamar next() com token válido', async () => {
    const fakeUser = { id: 'user-123', name: 'João', email: 'joao@test.com' };
    mockIsTokenBlacklisted.mockReturnValue(false);
    mockVerifyToken.mockReturnValue({ userId: 'user-123' });
    mockFindById.mockResolvedValue(fakeUser);

    const req = createMockReq('Bearer valid-token');
    const next = jest.fn();

    await authMiddleware(req, {}, next);

    expect(mockIsTokenBlacklisted).toHaveBeenCalledWith('valid-token');
    expect(mockVerifyToken).toHaveBeenCalledWith('valid-token');
    expect(mockFindById).toHaveBeenCalledWith('user-123');
    expect(req.user).toEqual(fakeUser);
    expect(next).toHaveBeenCalledWith();
  });

  test('deve chamar next com AppError UNAUTHORIZED quando header Authorization está ausente', async () => {
    const req = createMockReq(undefined);
    const next = jest.fn();

    await authMiddleware(req, {}, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0][0];
    expect(error.code).toBe('UNAUTHORIZED');
  });

  test('deve chamar next com AppError UNAUTHORIZED quando header não usa Bearer scheme', async () => {
    const req = createMockReq('Basic abc123');
    const next = jest.fn();

    await authMiddleware(req, {}, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0][0];
    expect(error.code).toBe('UNAUTHORIZED');
  });

  test('deve chamar next com AppError UNAUTHORIZED quando token está na blacklist', async () => {
    mockIsTokenBlacklisted.mockReturnValue(true);

    const req = createMockReq('Bearer blacklisted-token');
    const next = jest.fn();

    await authMiddleware(req, {}, next);

    expect(mockIsTokenBlacklisted).toHaveBeenCalledWith('blacklisted-token');
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0][0];
    expect(error.code).toBe('UNAUTHORIZED');
    expect(error.message).toBe('Token invalidado');
  });

  test('deve chamar next com AppError UNAUTHORIZED quando token é inválido', async () => {
    mockIsTokenBlacklisted.mockReturnValue(false);
    mockVerifyToken.mockImplementation(() => {
      throw new AppError('UNAUTHORIZED', 'Token inválido ou expirado');
    });

    const req = createMockReq('Bearer invalid-token');
    const next = jest.fn();

    await authMiddleware(req, {}, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0][0];
    expect(error.code).toBe('UNAUTHORIZED');
  });

  test('deve chamar next com AppError UNAUTHORIZED quando usuário não existe', async () => {
    mockIsTokenBlacklisted.mockReturnValue(false);
    mockVerifyToken.mockReturnValue({ userId: 'nonexistent-id' });
    mockFindById.mockResolvedValue(null);

    const req = createMockReq('Bearer valid-token');
    const next = jest.fn();

    await authMiddleware(req, {}, next);

    expect(mockFindById).toHaveBeenCalledWith('nonexistent-id');
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0][0];
    expect(error.code).toBe('UNAUTHORIZED');
    expect(error.message).toBe('Usuário não encontrado');
  });

  test('deve encapsular erros inesperados como AppError UNAUTHORIZED', async () => {
    mockIsTokenBlacklisted.mockReturnValue(false);
    mockVerifyToken.mockImplementation(() => {
      throw new TypeError('algo inesperado');
    });

    const req = createMockReq('Bearer some-token');
    const next = jest.fn();

    await authMiddleware(req, {}, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0][0];
    expect(error.code).toBe('UNAUTHORIZED');
    expect(error.message).toBe('Falha na autenticação');
  });

  test('deve chamar next com AppError quando header é "Bearer " sem token', async () => {
    const req = createMockReq('Bearer ');
    const next = jest.fn();

    await authMiddleware(req, {}, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0][0];
    expect(error.code).toBe('UNAUTHORIZED');
  });
});
