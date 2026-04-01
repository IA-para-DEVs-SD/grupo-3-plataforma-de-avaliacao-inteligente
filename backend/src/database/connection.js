// Módulo de conexão com banco de dados SQLite
// Responsável por inicializar o banco, criar tabelas e fornecer instância singleton
import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const DB_PATH = process.env.DB_PATH || './data/insightreview.db';

/** @type {Database.Database | null} */
let dbInstance = null;

/**
 * SQL de criação das tabelas do sistema.
 * Executado na inicialização do banco (CREATE IF NOT EXISTS).
 */
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
    smart_score_confidence INTEGER DEFAULT 0,
    score_explanation TEXT,
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
const CREATE_INDEXES_SQL = `
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
  CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
  CREATE INDEX IF NOT EXISTS idx_product_insights_product_id ON product_insights(product_id);
`;

/**
 * Aplica migrations incrementais para bancos já existentes.
 * Adiciona colunas novas sem recriar tabelas (ALTER TABLE IF NOT EXISTS não existe no SQLite).
 * @param {Database.Database} db
 */
function applyMigrations(db) {
  // Migration: adiciona smart_score_confidence se não existir
  const cols = db.pragma('table_info(product_insights)');
  const hasConfidence = cols.some((c) => c.name === 'smart_score_confidence');
  if (!hasConfidence) {
    db.exec('ALTER TABLE product_insights ADD COLUMN smart_score_confidence INTEGER DEFAULT 0');
  }
  const hasExplanation = cols.some((c) => c.name === 'score_explanation');
  if (!hasExplanation) {
    db.exec('ALTER TABLE product_insights ADD COLUMN score_explanation TEXT');
  }
}

/**
 * Aplica o schema (tabelas e índices) em uma instância de banco.
 * @param {Database.Database} db - Instância do banco de dados
 */
function applySchema(db) {
  db.exec(CREATE_TABLES_SQL);
  db.exec(CREATE_INDEXES_SQL);
  applyMigrations(db);
}

/**
 * Retorna a instância singleton do banco de dados.
 * Cria o diretório de dados e inicializa o banco na primeira chamada.
 * @returns {Database.Database} Instância do banco SQLite
 */
export function getDb() {
  if (dbInstance) return dbInstance;

  // Garante que o diretório do banco existe
  const dir = dirname(DB_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  dbInstance = new Database(DB_PATH);

  // Ativa WAL mode para melhor performance em leituras concorrentes
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');

  applySchema(dbInstance);

  return dbInstance;
}

/**
 * Fecha a conexão com o banco e limpa a referência singleton.
 * Usado para cleanup em testes e encerramento do servidor.
 */
export function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Retorna uma instância de banco em memória para testes.
 * Possui o mesmo schema do banco principal, mas sem persistência em disco.
 * @returns {Database.Database} Instância do banco SQLite em memória
 */
export function getTestDb() {
  const testDb = new Database(':memory:');

  testDb.pragma('journal_mode = WAL');
  testDb.pragma('foreign_keys = ON');

  applySchema(testDb);

  return testDb;
}
