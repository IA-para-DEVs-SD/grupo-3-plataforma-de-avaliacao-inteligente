// Testes unitários para o modelo de usuário
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { getTestDb } from '../database/connection.js';

let testDb;
let createUser, findByEmail, findById;

beforeEach(async () => {
  testDb = getTestDb();

  // Mock do módulo de conexão para retornar o banco de teste em memória
  jest.unstable_mockModule('../database/connection.js', () => ({
    getDb: () => testDb,
    getTestDb,
  }));

  // Importa o modelo após o mock estar configurado
  const userModel = await import('./user-model.js');
  createUser = userModel.createUser;
  findByEmail = userModel.findByEmail;
  findById = userModel.findById;
});

afterEach(() => {
  if (testDb) {
    testDb.close();
    testDb = null;
  }
  jest.restoreAllMocks();
});

describe('user-model — createUser', () => {
  test('deve criar usuário e retornar objeto sem passwordHash', async () => {
    const user = await createUser({
      name: 'João Silva',
      email: 'joao@test.com',
      passwordHash: 'hashed_password_123',
    });

    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.name).toBe('João Silva');
    expect(user.email).toBe('joao@test.com');
    expect(user.emailVerified).toBe(0);
    expect(user.createdAt).toBeDefined();
    // Não deve expor o hash da senha
    expect(user.passwordHash).toBeUndefined();
    expect(user.password_hash).toBeUndefined();
  });

  test('deve gerar UUID único para cada usuário', async () => {
    const user1 = await createUser({
      name: 'User 1',
      email: 'user1@test.com',
      passwordHash: 'hash1',
    });

    const user2 = await createUser({
      name: 'User 2',
      email: 'user2@test.com',
      passwordHash: 'hash2',
    });

    expect(user1.id).not.toBe(user2.id);
    // Formato UUID v4
    expect(user1.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  test('deve lançar erro ao tentar criar usuário com email duplicado', async () => {
    await createUser({
      name: 'User 1',
      email: 'duplicado@test.com',
      passwordHash: 'hash1',
    });

    // SQLite lança SqliteError para UNIQUE constraint violation
    await expect(
      createUser({
        name: 'User 2',
        email: 'duplicado@test.com',
        passwordHash: 'hash2',
      })
    ).rejects.toThrow(/UNIQUE constraint failed|unique/i);
  });

  test('deve persistir o hash da senha no banco', async () => {
    const user = await createUser({
      name: 'Test',
      email: 'persist@test.com',
      passwordHash: 'my_secret_hash',
    });

    // Verifica diretamente no banco que o hash foi salvo
    const row = testDb.prepare('SELECT password_hash FROM users WHERE id = ?').get(user.id);
    expect(row.password_hash).toBe('my_secret_hash');
  });
});

describe('user-model — findByEmail', () => {
  test('deve retornar usuário existente com passwordHash', async () => {
    await createUser({
      name: 'Maria',
      email: 'maria@test.com',
      passwordHash: 'hash_maria',
    });

    const found = await findByEmail('maria@test.com');

    expect(found).toBeDefined();
    expect(found.name).toBe('Maria');
    expect(found.email).toBe('maria@test.com');
    expect(found.passwordHash).toBe('hash_maria');
    expect(found.emailVerified).toBe(0);
    expect(found.createdAt).toBeDefined();
  });

  test('deve retornar null para email inexistente', async () => {
    const found = await findByEmail('naoexiste@test.com');
    expect(found).toBeNull();
  });
});

describe('user-model — findById', () => {
  test('deve retornar usuário existente sem passwordHash', async () => {
    const created = await createUser({
      name: 'Carlos',
      email: 'carlos@test.com',
      passwordHash: 'hash_carlos',
    });

    const found = await findById(created.id);

    expect(found).toBeDefined();
    expect(found.id).toBe(created.id);
    expect(found.name).toBe('Carlos');
    expect(found.email).toBe('carlos@test.com');
    expect(found.emailVerified).toBe(0);
    expect(found.createdAt).toBeDefined();
    // Não deve expor o hash da senha
    expect(found.passwordHash).toBeUndefined();
    expect(found.password_hash).toBeUndefined();
  });

  test('deve retornar null para id inexistente', async () => {
    const found = await findById('id-que-nao-existe');
    expect(found).toBeNull();
  });
});
