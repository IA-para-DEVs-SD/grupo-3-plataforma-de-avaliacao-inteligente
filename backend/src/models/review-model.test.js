// Testes unitários para o modelo de avaliação
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { getTestDb } from '../database/connection.js';

let testDb;
let createReview, findByProductId, findById, updateSentiment, countByProductId, findAllByProductId;

// Cria um usuário auxiliar para FK user_id
async function createTestUser(db) {
  const { v4: uuidv4 } = await import('uuid');
  const id = uuidv4();
  db.prepare(
    'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)'
  ).run(id, 'Usuário Teste', `user-${id}@test.com`, 'hash_test');
  return id;
}

// Cria um produto auxiliar para FK product_id
async function createTestProduct(db, userId) {
  const { v4: uuidv4 } = await import('uuid');
  const id = uuidv4();
  db.prepare(
    'INSERT INTO products (id, name, description, category, created_by) VALUES (?, ?, ?, ?, ?)'
  ).run(id, 'Produto Teste', 'Descrição do produto teste', 'Categoria', userId);
  return id;
}

beforeEach(async () => {
  testDb = getTestDb();

  jest.unstable_mockModule('../database/connection.js', () => ({
    getDb: () => testDb,
    getTestDb,
  }));

  const reviewModel = await import('./review-model.js');
  createReview = reviewModel.createReview;
  findByProductId = reviewModel.findByProductId;
  findById = reviewModel.findById;
  updateSentiment = reviewModel.updateSentiment;
  countByProductId = reviewModel.countByProductId;
  findAllByProductId = reviewModel.findAllByProductId;
});

afterEach(() => {
  if (testDb) {
    testDb.close();
    testDb = null;
  }
  jest.restoreAllMocks();
});

describe('review-model — createReview', () => {
  test('deve criar avaliação e retornar objeto completo', async () => {
    const userId = await createTestUser(testDb);
    const productId = await createTestProduct(testDb, userId);

    const review = await createReview({
      productId,
      userId,
      text: 'Este produto é excelente, recomendo muito para todos!',
      rating: 5,
    });

    expect(review).toBeDefined();
    expect(review.id).toBeDefined();
    expect(review.productId).toBe(productId);
    expect(review.userId).toBe(userId);
    expect(review.text).toBe('Este produto é excelente, recomendo muito para todos!');
    expect(review.rating).toBe(5);
    expect(review.sentiment).toBeNull();
    expect(review.sentimentProcessedAt).toBeNull();
    expect(review.createdAt).toBeDefined();
  });

  test('deve gerar UUID único para cada avaliação', async () => {
    const userId = await createTestUser(testDb);
    const productId = await createTestProduct(testDb, userId);

    const r1 = await createReview({ productId, userId, text: 'Avaliação número um do produto teste', rating: 4 });
    const r2 = await createReview({ productId, userId, text: 'Avaliação número dois do produto teste', rating: 3 });

    expect(r1.id).not.toBe(r2.id);
    expect(r1.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
});

describe('review-model — findById', () => {
  test('deve retornar avaliação existente', async () => {
    const userId = await createTestUser(testDb);
    const productId = await createTestProduct(testDb, userId);

    const created = await createReview({
      productId,
      userId,
      text: 'Produto muito bom, gostei bastante dele',
      rating: 4,
    });

    const found = await findById(created.id);

    expect(found).toBeDefined();
    expect(found.id).toBe(created.id);
    expect(found.productId).toBe(productId);
    expect(found.userId).toBe(userId);
    expect(found.text).toBe('Produto muito bom, gostei bastante dele');
    expect(found.rating).toBe(4);
  });

  test('deve retornar null para id inexistente', async () => {
    const found = await findById('id-que-nao-existe');
    expect(found).toBeNull();
  });
});

describe('review-model — findByProductId', () => {
  let userId, productId;

  beforeEach(async () => {
    userId = await createTestUser(testDb);
    productId = await createTestProduct(testDb, userId);
  });

  test('deve retornar avaliações de um produto com paginação padrão', async () => {
    await createReview({ productId, userId, text: 'Avaliação de teste para o produto', rating: 4 });
    await createReview({ productId, userId, text: 'Outra avaliação de teste para o produto', rating: 3 });

    const result = await findByProductId(productId);

    expect(result.reviews).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  test('deve ordenar por data decrescente por padrão', async () => {
    // Insere com datas diferentes para garantir ordenação
    testDb.prepare(
      "INSERT INTO reviews (id, product_id, user_id, text, rating, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).run('r1', productId, userId, 'Primeira avaliação do produto', 3, '2024-01-01 10:00:00');
    testDb.prepare(
      "INSERT INTO reviews (id, product_id, user_id, text, rating, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).run('r2', productId, userId, 'Segunda avaliação do produto', 5, '2024-01-02 10:00:00');

    const result = await findByProductId(productId);

    expect(result.reviews[0].id).toBe('r2'); // mais recente primeiro
    expect(result.reviews[1].id).toBe('r1');
  });

  test('deve filtrar por sentimento', async () => {
    const r1 = await createReview({ productId, userId, text: 'Avaliação positiva do produto teste', rating: 5 });
    const r2 = await createReview({ productId, userId, text: 'Avaliação negativa do produto teste', rating: 1 });

    await updateSentiment(r1.id, 'positive');
    await updateSentiment(r2.id, 'negative');

    const result = await findByProductId(productId, { sentiment: 'positive' });

    expect(result.reviews).toHaveLength(1);
    expect(result.reviews[0].sentiment).toBe('positive');
    expect(result.total).toBe(1);
  });

  test('deve ordenar por nota crescente', async () => {
    await createReview({ productId, userId, text: 'Avaliação com nota alta do produto', rating: 5 });
    await createReview({ productId, userId, text: 'Avaliação com nota baixa do produto', rating: 1 });

    const result = await findByProductId(productId, { sort: 'rating_asc' });

    expect(result.reviews[0].rating).toBe(1);
    expect(result.reviews[1].rating).toBe(5);
  });

  test('deve ordenar por nota decrescente', async () => {
    await createReview({ productId, userId, text: 'Avaliação com nota baixa do produto', rating: 1 });
    await createReview({ productId, userId, text: 'Avaliação com nota alta do produto', rating: 5 });

    const result = await findByProductId(productId, { sort: 'rating_desc' });

    expect(result.reviews[0].rating).toBe(5);
    expect(result.reviews[1].rating).toBe(1);
  });

  test('deve paginar com 10 itens por página', async () => {
    // Cria 12 avaliações
    for (let i = 0; i < 12; i++) {
      await createReview({ productId, userId, text: `Avaliação número ${i + 1} para teste de paginação`, rating: (i % 5) + 1 });
    }

    const page1 = await findByProductId(productId, { page: 1 });
    expect(page1.reviews).toHaveLength(10);
    expect(page1.total).toBe(12);
    expect(page1.totalPages).toBe(2);

    const page2 = await findByProductId(productId, { page: 2 });
    expect(page2.reviews).toHaveLength(2);
    expect(page2.page).toBe(2);
  });

  test('deve filtrar por padrão de texto (case-insensitive)', async () => {
    await createReview({ productId, userId, text: 'A bateria deste produto dura muito pouco', rating: 2 });
    await createReview({ productId, userId, text: 'O design do produto é muito bonito', rating: 4 });

    const result = await findByProductId(productId, { pattern: 'bateria' });

    expect(result.reviews).toHaveLength(1);
    expect(result.reviews[0].text).toContain('bateria');
  });

  test('deve retornar resultado vazio para produto sem avaliações', async () => {
    const result = await findByProductId(productId);

    expect(result.reviews).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});

describe('review-model — updateSentiment', () => {
  test('deve atualizar sentimento e data de processamento', async () => {
    const userId = await createTestUser(testDb);
    const productId = await createTestProduct(testDb, userId);

    const review = await createReview({ productId, userId, text: 'Produto excelente, recomendo para todos', rating: 5 });
    const updated = await updateSentiment(review.id, 'positive');

    expect(updated.sentiment).toBe('positive');
    expect(updated.sentimentProcessedAt).toBeDefined();
  });

  test('deve retornar null para id inexistente', async () => {
    const result = await updateSentiment('id-inexistente', 'positive');
    expect(result).toBeNull();
  });
});

describe('review-model — countByProductId', () => {
  test('deve contar avaliações de um produto', async () => {
    const userId = await createTestUser(testDb);
    const productId = await createTestProduct(testDb, userId);

    await createReview({ productId, userId, text: 'Primeira avaliação do produto teste', rating: 4 });
    await createReview({ productId, userId, text: 'Segunda avaliação do produto teste', rating: 3 });

    const count = await countByProductId(productId);
    expect(count).toBe(2);
  });

  test('deve retornar zero para produto sem avaliações', async () => {
    const userId = await createTestUser(testDb);
    const productId = await createTestProduct(testDb, userId);

    const count = await countByProductId(productId);
    expect(count).toBe(0);
  });
});

describe('review-model — findAllByProductId', () => {
  test('deve retornar todas as avaliações sem paginação', async () => {
    const userId = await createTestUser(testDb);
    const productId = await createTestProduct(testDb, userId);

    for (let i = 0; i < 15; i++) {
      await createReview({ productId, userId, text: `Avaliação número ${i + 1} para teste sem paginação`, rating: (i % 5) + 1 });
    }

    const reviews = await findAllByProductId(productId);
    expect(reviews).toHaveLength(15);
  });

  test('deve retornar array vazio para produto sem avaliações', async () => {
    const userId = await createTestUser(testDb);
    const productId = await createTestProduct(testDb, userId);

    const reviews = await findAllByProductId(productId);
    expect(reviews).toHaveLength(0);
  });
});
