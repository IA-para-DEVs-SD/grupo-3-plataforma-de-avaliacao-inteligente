// Testes unitários para o modelo de produto
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { getTestDb } from '../database/connection.js';

let testDb;
let createProduct, findById, search;

// Cria um usuário auxiliar para FK created_by
async function createTestUser(db) {
  const { v4: uuidv4 } = await import('uuid');
  const id = uuidv4();
  db.prepare(
    'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)'
  ).run(id, 'Usuário Teste', `user-${id}@test.com`, 'hash_test');
  return id;
}

beforeEach(async () => {
  testDb = getTestDb();

  // Mock do módulo de conexão para retornar o banco de teste em memória
  jest.unstable_mockModule('../database/connection.js', () => ({
    getDb: () => testDb,
    getTestDb,
  }));

  // Importa o modelo após o mock estar configurado
  const productModel = await import('./product-model.js');
  createProduct = productModel.createProduct;
  findById = productModel.findById;
  search = productModel.search;
});

afterEach(() => {
  if (testDb) {
    testDb.close();
    testDb = null;
  }
  jest.restoreAllMocks();
});

describe('product-model — createProduct', () => {
  test('deve criar produto e retornar objeto completo', async () => {
    const userId = await createTestUser(testDb);

    const product = await createProduct({
      name: 'Notebook XYZ',
      description: 'Um notebook potente para trabalho',
      category: 'Eletrônicos',
      imageUrl: 'https://example.com/img.jpg',
      createdBy: userId,
    });

    expect(product).toBeDefined();
    expect(product.id).toBeDefined();
    expect(product.name).toBe('Notebook XYZ');
    expect(product.description).toBe('Um notebook potente para trabalho');
    expect(product.category).toBe('Eletrônicos');
    expect(product.imageUrl).toBe('https://example.com/img.jpg');
    expect(product.createdBy).toBe(userId);
    expect(product.createdAt).toBeDefined();
  });

  test('deve gerar UUID único para cada produto', async () => {
    const userId = await createTestUser(testDb);

    const p1 = await createProduct({
      name: 'Produto 1',
      description: 'Descrição do produto 1',
      category: 'Cat A',
      createdBy: userId,
    });

    const p2 = await createProduct({
      name: 'Produto 2',
      description: 'Descrição do produto 2',
      category: 'Cat B',
      createdBy: userId,
    });

    expect(p1.id).not.toBe(p2.id);
    expect(p1.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  test('deve aceitar imageUrl nulo por padrão', async () => {
    const userId = await createTestUser(testDb);

    const product = await createProduct({
      name: 'Produto Sem Imagem',
      description: 'Descrição sem imagem',
      category: 'Geral',
      createdBy: userId,
    });

    expect(product.imageUrl).toBeNull();
  });
});

describe('product-model — findById', () => {
  test('deve retornar produto existente', async () => {
    const userId = await createTestUser(testDb);

    const created = await createProduct({
      name: 'Teclado Mecânico',
      description: 'Teclado com switches blue',
      category: 'Periféricos',
      imageUrl: 'https://example.com/teclado.jpg',
      createdBy: userId,
    });

    const found = await findById(created.id);

    expect(found).toBeDefined();
    expect(found.id).toBe(created.id);
    expect(found.name).toBe('Teclado Mecânico');
    expect(found.description).toBe('Teclado com switches blue');
    expect(found.category).toBe('Periféricos');
    expect(found.imageUrl).toBe('https://example.com/teclado.jpg');
    expect(found.createdBy).toBe(userId);
    expect(found.createdAt).toBeDefined();
  });

  test('deve retornar null para id inexistente', async () => {
    const found = await findById('id-que-nao-existe');
    expect(found).toBeNull();
  });
});

describe('product-model — search', () => {
  let userId;

  beforeEach(async () => {
    userId = await createTestUser(testDb);

    await createProduct({ name: 'Notebook Dell', description: 'Notebook para trabalho', category: 'Eletrônicos', createdBy: userId });
    await createProduct({ name: 'Mouse Gamer', description: 'Mouse com sensor óptico', category: 'Periféricos', createdBy: userId });
    await createProduct({ name: 'Cadeira Ergonômica', description: 'Cadeira para escritório', category: 'Móveis', createdBy: userId });
  });

  test('deve retornar todos os produtos quando termo é vazio', async () => {
    const results = await search('');
    expect(results).toHaveLength(3);
  });

  test('deve retornar todos os produtos quando termo é null', async () => {
    const results = await search(null);
    expect(results).toHaveLength(3);
  });

  test('deve retornar todos os produtos quando termo é undefined', async () => {
    const results = await search(undefined);
    expect(results).toHaveLength(3);
  });

  test('deve buscar por nome (case-insensitive)', async () => {
    const results = await search('notebook');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Notebook Dell');
  });

  test('deve buscar por categoria (case-insensitive)', async () => {
    const results = await search('periféricos');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Mouse Gamer');
  });

  test('deve retornar array vazio quando nenhum produto corresponde', async () => {
    const results = await search('inexistente');
    expect(results).toHaveLength(0);
  });

  test('deve buscar com correspondência parcial', async () => {
    const results = await search('note');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Notebook Dell');
  });

  test('deve retornar múltiplos resultados quando termo corresponde a vários produtos', async () => {
    // "e" aparece em "Eletrônicos", "Periféricos" e "Móveis" — mas vamos buscar algo mais específico
    await createProduct({ name: 'Teclado Gamer', description: 'Teclado mecânico', category: 'Periféricos', createdBy: userId });

    const results = await search('Gamer');
    expect(results).toHaveLength(2);
  });
});
