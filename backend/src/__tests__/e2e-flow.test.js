// Teste de integração e2e — fluxo completo: cadastro → login → criar produto → submeter avaliação → listar avaliações → consultar insights
// Valida o fluxo principal do usuário de ponta a ponta usando supertest com banco em memória
import { jest, describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import Database from 'better-sqlite3';

// --- Configuração do ambiente de teste ---
process.env.JWT_SECRET = 'e2e-test-secret-key';
process.env.NODE_ENV = 'test';

// --- Banco em memória compartilhado para todo o fluxo e2e ---
let testDb = null;

// SQL de criação das tabelas (mesmo schema do connection.js)
const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email_verified INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    created_by TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    text TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    sentiment TEXT CHECK(sentiment IN ('positive', 'neutral', 'negative')),
    sentiment_processed_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS product_insights (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL UNIQUE,
    summary TEXT,
    patterns TEXT,
    smart_score REAL,
    simple_average REAL,
    sentiment_distribution TEXT,
    review_count_at_last_update INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`;

const CREATE_INDEXES_SQL = `
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
  CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
  CREATE INDEX IF NOT EXISTS idx_product_insights_product_id ON product_insights(product_id);
`;

/**
 * Cria banco em memória com schema completo para o teste e2e.
 */
function createE2eTestDb() {
  const db = new Database(':memory:');
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(CREATE_TABLES_SQL);
  db.exec(CREATE_INDEXES_SQL);
  return db;
}

// --- Mock do módulo de conexão para usar banco em memória ---
jest.unstable_mockModule('../database/connection.js', () => ({
  getDb: () => testDb,
  closeDb: () => {
    if (testDb) {
      testDb.close();
      testDb = null;
    }
  },
  getTestDb: () => createE2eTestDb(),
}));

// --- Importa o app Express após o mock do banco ---
const { default: app } = await import('../server.js');
const { default: request } = await import('supertest');

// --- Dados do fluxo e2e ---
const TEST_USER = {
  name: 'Maria Silva',
  email: 'maria.e2e@teste.com',
  password: 'senhaSegura123',
};

const TEST_PRODUCT = {
  name: 'Fone Bluetooth XYZ',
  description: 'Fone de ouvido sem fio com cancelamento de ruído ativo',
  category: 'Eletrônicos',
};

const TEST_REVIEW = {
  text: 'Produto excelente, qualidade de som incrível e bateria dura bastante!',
  rating: 5,
};

describe('Fluxo e2e: cadastro → login → produto → avaliação → insights', () => {
  let authToken = null;
  let productId = null;
  let reviewId = null;

  beforeAll(() => {
    testDb = createE2eTestDb();
  });

  afterAll(() => {
    if (testDb) {
      testDb.close();
      testDb = null;
    }
  });

  // Passo 1: Cadastro de usuário
  test('1. Cadastro de usuário com dados válidos retorna 201 com token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(TEST_USER);

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.name).toBe(TEST_USER.name);
    expect(res.body.user.email).toBe(TEST_USER.email);
    expect(res.body.token).toBeDefined();
  });

  // Passo 2: Login com o usuário cadastrado
  test('2. Login com credenciais válidas retorna 200 com token JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe('string');

    // Armazena o token para os próximos passos
    authToken = res.body.token;
  });

  // Passo 3: Criar um produto (autenticado)
  test('3. Criação de produto autenticado retorna 201 com dados do produto', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send(TEST_PRODUCT);

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe(TEST_PRODUCT.name);
    expect(res.body.description).toBe(TEST_PRODUCT.description);
    expect(res.body.category).toBe(TEST_PRODUCT.category);

    // Armazena o ID do produto para os próximos passos
    productId = res.body.id;
  });

  // Passo 4: Submeter uma avaliação para o produto
  test('4. Submissão de avaliação autenticada retorna 201 com dados da avaliação', async () => {
    const res = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(TEST_REVIEW);

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.productId).toBe(productId);
    expect(res.body.text).toBe(TEST_REVIEW.text);
    expect(res.body.rating).toBe(TEST_REVIEW.rating);

    // Armazena o ID da avaliação
    reviewId = res.body.id;
  });

  // Passo 5: Verificar que a avaliação aparece na listagem do produto
  test('5. Listagem de avaliações do produto contém a avaliação submetida', async () => {
    const res = await request(app)
      .get(`/api/products/${productId}/reviews`);

    expect(res.status).toBe(200);
    expect(res.body.reviews).toBeDefined();
    expect(Array.isArray(res.body.reviews)).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(1);

    // Verifica que a avaliação criada está na lista
    const found = res.body.reviews.find((r) => r.id === reviewId);
    expect(found).toBeDefined();
    expect(found.text).toBe(TEST_REVIEW.text);
    expect(found.rating).toBe(TEST_REVIEW.rating);
  });

  // Passo 6: Consultar insights do produto (pode ser null inicialmente pois IA é assíncrona)
  test('6. Endpoint de insights retorna 200 (insights podem ser null inicialmente)', async () => {
    const res = await request(app)
      .get(`/api/products/${productId}/insights`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('insights');
    // Insights podem ser null se a IA ainda não processou, ou um objeto se já processou
    if (res.body.insights !== null) {
      // Se já houver insights, verifica a estrutura básica
      expect(res.body.insights).toHaveProperty('productId');
    }
  });
});
