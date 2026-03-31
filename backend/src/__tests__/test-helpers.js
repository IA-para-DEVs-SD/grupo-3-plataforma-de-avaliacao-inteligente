// Módulo compartilhado de helpers para testes de propriedade (PBT)
// Centraliza criação de banco em memória, schema SQL e inserção de dados de teste
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

/**
 * SQL de criação das tabelas do sistema (mesmo schema do connection.js).
 * Centralizado aqui para evitar duplicação entre arquivos de teste.
 */
export const CREATE_TABLES_SQL = `
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

/**
 * SQL de criação dos índices para otimizar consultas frequentes.
 */
export const CREATE_INDEXES_SQL = `
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
  CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
  CREATE INDEX IF NOT EXISTS idx_product_insights_product_id ON product_insights(product_id);
`;

/**
 * Cria um banco em memória com schema completo aplicado.
 * Usado para isolar cada iteração do PBT com estado limpo.
 * @returns {Database.Database} instância do banco SQLite em memória
 */
export function createFreshTestDb() {
  const db = new Database(':memory:');
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(CREATE_TABLES_SQL);
  db.exec(CREATE_INDEXES_SQL);
  return db;
}

/**
 * Insere um usuário de teste diretamente no banco para satisfazer FK.
 * @param {Database.Database} db — instância do banco
 * @returns {string} ID do usuário criado
 */
export function insertTestUser(db) {
  const userId = uuidv4();
  db.prepare(
    "INSERT INTO users (id, name, email, password_hash) VALUES (?, 'Test User', ?, 'hash123')"
  ).run(userId, `user-${userId}@test.com`);
  return userId;
}

/**
 * Insere um produto de teste diretamente no banco para satisfazer FK.
 * @param {Database.Database} db — instância do banco
 * @param {string} userId — ID do usuário criador
 * @returns {string} ID do produto criado
 */
export function insertTestProduct(db, userId) {
  const productId = uuidv4();
  db.prepare(
    "INSERT INTO products (id, name, description, category, created_by) VALUES (?, 'Produto Teste', 'Descrição do produto teste', 'Eletrônicos', ?)"
  ).run(productId, userId);
  return productId;
}

/**
 * Insere uma avaliação diretamente no banco com sentimento e timestamp controlados.
 * Útil para testes que precisam de controle fino sobre os dados inseridos.
 * @param {Database.Database} db — instância do banco
 * @param {{ productId: string, userId: string, text: string, rating: number, sentiment?: string, createdAt?: string }} data — dados da avaliação
 * @returns {string} ID da avaliação criada
 */
export function insertReviewDirect(db, { productId, userId, text, rating, sentiment = null, createdAt = null }) {
  const id = uuidv4();
  const ts = createdAt || new Date().toISOString().replace('T', ' ').slice(0, 19);
  db.prepare(
    'INSERT INTO reviews (id, product_id, user_id, text, rating, sentiment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, productId, userId, text, rating, sentiment, ts);
  return id;
}
