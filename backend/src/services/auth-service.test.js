// Testes unitários para auth-service.js
import { jest, describe, it, expect, beforeAll, beforeEach } from '@jest/globals';

// Mock do user-model antes de importar o auth-service
const mockFindByEmail = jest.fn();
const mockCreateUser = jest.fn();

jest.unstable_mockModule('../models/user-model.js', () => ({
  findByEmail: mockFindByEmail,
  createUser: mockCreateUser,
}));

// Importa auth-service após configurar o mock
const {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  registerUser,
  loginUser,
  logoutUser,
  isTokenBlacklisted,
} = await import('./auth-service.js');

// Configura JWT_SECRET para os testes
const TEST_SECRET = 'test-secret-key-for-jwt';

beforeAll(() => {
  process.env.JWT_SECRET = TEST_SECRET;
});

beforeEach(() => {
  mockFindByEmail.mockReset();
  mockCreateUser.mockReset();
});

describe('hashPassword / comparePassword', () => {
  it('deve gerar um hash diferente da senha original', async () => {
    const password = 'minhasenha123';
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(hash).toBeTruthy();
  });

  it('deve retornar true ao comparar senha correta com seu hash', async () => {
    const password = 'senhaSegura99';
    const hash = await hashPassword(password);
    const result = await comparePassword(password, hash);
    expect(result).toBe(true);
  });

  it('deve retornar false ao comparar senha incorreta com o hash', async () => {
    const password = 'senhaCorreta';
    const hash = await hashPassword(password);
    const result = await comparePassword('senhaErrada', hash);
    expect(result).toBe(false);
  });
});

describe('generateToken / verifyToken', () => {
  it('deve gerar um token JWT válido com userId no payload', () => {
    const userId = 'user-123';
    const token = generateToken(userId);
    expect(typeof token).toBe('string');

    const payload = verifyToken(token);
    expect(payload.userId).toBe(userId);
  });

  it('deve lançar AppError ao verificar token inválido', () => {
    expect(() => verifyToken('token-invalido')).toThrow();
    try {
      verifyToken('token-invalido');
    } catch (err) {
      expect(err.code).toBe('UNAUTHORIZED');
      expect(err.statusCode).toBe(401);
    }
  });
});

describe('registerUser', () => {
  it('deve registrar um novo usuário e retornar user + token', async () => {
    const fakeUser = { id: 'uuid-1', name: 'João', email: 'joao@test.com', emailVerified: 0, createdAt: '2024-01-01' };

    mockFindByEmail.mockResolvedValue(null);
    mockCreateUser.mockResolvedValue(fakeUser);

    const result = await registerUser({ name: 'João', email: 'joao@test.com', password: 'senha1234' });

    expect(result.user).toEqual(fakeUser);
    expect(typeof result.token).toBe('string');
    expect(mockFindByEmail).toHaveBeenCalledWith('joao@test.com');
  });

  it('deve lançar EMAIL_ALREADY_EXISTS se o e-mail já estiver cadastrado', async () => {
    mockFindByEmail.mockResolvedValue({ id: 'uuid-2', name: 'Maria', email: 'maria@test.com' });

    await expect(
      registerUser({ name: 'Maria', email: 'maria@test.com', password: 'senha1234' })
    ).rejects.toMatchObject({
      code: 'EMAIL_ALREADY_EXISTS',
      statusCode: 409,
    });
  });
});

describe('loginUser', () => {
  it('deve autenticar com credenciais válidas e retornar user + token', async () => {
    const passwordHash = await hashPassword('senha1234');
    const fakeUser = { id: 'uuid-3', name: 'Carlos', email: 'carlos@test.com', passwordHash, emailVerified: 0, createdAt: '2024-01-01' };

    mockFindByEmail.mockResolvedValue(fakeUser);

    const result = await loginUser({ email: 'carlos@test.com', password: 'senha1234' });

    expect(result.user.id).toBe('uuid-3');
    expect(result.user.email).toBe('carlos@test.com');
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(typeof result.token).toBe('string');
  });

  it('deve lançar INVALID_CREDENTIALS se o e-mail não existir', async () => {
    mockFindByEmail.mockResolvedValue(null);

    await expect(
      loginUser({ email: 'naoexiste@test.com', password: 'qualquer' })
    ).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
      statusCode: 401,
    });
  });

  it('deve lançar INVALID_CREDENTIALS se a senha estiver incorreta', async () => {
    const passwordHash = await hashPassword('senhaCorreta');
    mockFindByEmail.mockResolvedValue({ id: 'uuid-4', name: 'Ana', email: 'ana@test.com', passwordHash });

    await expect(
      loginUser({ email: 'ana@test.com', password: 'senhaErrada' })
    ).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
      statusCode: 401,
    });
  });
});

describe('logoutUser / isTokenBlacklisted', () => {
  it('deve adicionar token à blacklist após logout', () => {
    const token = generateToken('user-99');

    expect(isTokenBlacklisted(token)).toBe(false);

    logoutUser(token);

    expect(isTokenBlacklisted(token)).toBe(true);
  });

  it('não deve afetar outros tokens ao fazer logout de um', () => {
    const token1 = generateToken('user-a');
    const token2 = generateToken('user-b');

    logoutUser(token1);

    expect(isTokenBlacklisted(token1)).toBe(true);
    expect(isTokenBlacklisted(token2)).toBe(false);
  });
});
