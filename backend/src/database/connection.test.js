// Testes unitários para o módulo de conexão com banco de dados SQLite
import { describe, test, expect, afterEach } from '@jest/globals';
import { getDb, closeDb, getTestDb } from './connection.js';

describe('connection — getTestDb', () => {
  let db;

  afterEach(() => {
    if (db) {
      db.close();
      db = null;
    }
  });

  test('deve retornar instância de banco em memória funcional', () => {
    db = getTestDb();
    expect(db).toBeDefined();
    expect(db.open).toBe(true);
  });

  test('deve criar tabela users com colunas corretas', () => {
    db = getTestDb();
    const columns = db.pragma('table_info(users)');
    const columnNames = columns.map((c) => c.name);

    expect(columnNames).toEqual(
      expect.arrayContaining(['id', 'name', 'email', 'password_hash', 'email_verified', 'created_at'])
    );
  });

  test('deve criar tabela products com colunas corretas', () => {
    db = getTestDb();
    const columns = db.pragma('table_info(products)');
    const columnNames = columns.map((c) => c.name);

    expect(columnNames).toEqual(
      expect.arrayContaining(['id', 'name', 'description', 'category', 'image_url', 'created_by', 'created_at'])
    );
  });

  test('deve criar tabela reviews com colunas corretas', () => {
    db = getTestDb();
    const columns = db.pragma('table_info(reviews)');
    const columnNames = columns.map((c) => c.name);

    expect(columnNames).toEqual(
      expect.arrayContaining([
        'id', 'product_id', 'user_id', 'text', 'rating',
        'sentiment', 'sentiment_processed_at', 'created_at',
      ])
    );
  });

  test('deve criar tabela product_insights com colunas corretas', () => {
    db = getTestDb();
    const columns = db.pragma('table_info(product_insights)');
    const columnNames = columns.map((c) => c.name);

    expect(columnNames).toEqual(
      expect.arrayContaining([
        'id', 'product_id', 'summary', 'patterns', 'smart_score',
        'simple_average', 'sentiment_distribution', 'review_count_at_last_update', 'updated_at',
      ])
    );
  });

  test('deve criar índices nas colunas corretas', () => {
    db = getTestDb();
    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND name LIKE 'idx_%'").all();
    const indexNames = indexes.map((i) => i.name);

    expect(indexNames).toEqual(
      expect.arrayContaining([
        'idx_users_email',
        'idx_reviews_product_id',
        'idx_reviews_user_id',
        'idx_product_insights_product_id',
      ])
    );
  });

  test('deve ativar WAL mode no banco em memória', () => {
    db = getTestDb();
    const result = db.pragma('journal_mode');
    // Em memória, WAL pode ser reportado como 'memory' — ambos são aceitáveis
    expect(['wal', 'memory']).toContain(result[0].journal_mode);
  });

  test('deve ativar foreign keys', () => {
    db = getTestDb();
    const result = db.pragma('foreign_keys');
    expect(result[0].foreign_keys).toBe(1);
  });

  test('deve rejeitar rating fora do intervalo [1, 5] na tabela reviews', () => {
    db = getTestDb();

    // Insere usuário e produto necessários para FK
    db.prepare("INSERT INTO users (id, name, email, password_hash) VALUES ('u1', 'Test', 'test@test.com', 'hash')").run();
    db.prepare("INSERT INTO products (id, name, description, category, created_by) VALUES ('p1', 'Prod', 'Desc', 'Cat', 'u1')").run();

    // Rating 0 deve falhar
    expect(() => {
      db.prepare("INSERT INTO reviews (id, product_id, user_id, text, rating) VALUES ('r1', 'p1', 'u1', 'texto', 0)").run();
    }).toThrow();

    // Rating 6 deve falhar
    expect(() => {
      db.prepare("INSERT INTO reviews (id, product_id, user_id, text, rating) VALUES ('r2', 'p1', 'u1', 'texto', 6)").run();
    }).toThrow();
  });

  test('deve aceitar rating válido entre 1 e 5', () => {
    db = getTestDb();

    db.prepare("INSERT INTO users (id, name, email, password_hash) VALUES ('u1', 'Test', 'test@test.com', 'hash')").run();
    db.prepare("INSERT INTO products (id, name, description, category, created_by) VALUES ('p1', 'Prod', 'Desc', 'Cat', 'u1')").run();

    // Ratings 1 e 5 devem funcionar
    expect(() => {
      db.prepare("INSERT INTO reviews (id, product_id, user_id, text, rating) VALUES ('r1', 'p1', 'u1', 'texto', 1)").run();
      db.prepare("INSERT INTO reviews (id, product_id, user_id, text, rating) VALUES ('r2', 'p1', 'u1', 'texto', 5)").run();
    }).not.toThrow();
  });

  test('deve rejeitar sentiment inválido na tabela reviews', () => {
    db = getTestDb();

    db.prepare("INSERT INTO users (id, name, email, password_hash) VALUES ('u1', 'Test', 'test@test.com', 'hash')").run();
    db.prepare("INSERT INTO products (id, name, description, category, created_by) VALUES ('p1', 'Prod', 'Desc', 'Cat', 'u1')").run();

    expect(() => {
      db.prepare("INSERT INTO reviews (id, product_id, user_id, text, rating, sentiment) VALUES ('r1', 'p1', 'u1', 'texto', 3, 'invalid')").run();
    }).toThrow();
  });

  test('deve aceitar sentiment NULL na tabela reviews', () => {
    db = getTestDb();

    db.prepare("INSERT INTO users (id, name, email, password_hash) VALUES ('u1', 'Test', 'test@test.com', 'hash')").run();
    db.prepare("INSERT INTO products (id, name, description, category, created_by) VALUES ('p1', 'Prod', 'Desc', 'Cat', 'u1')").run();

    expect(() => {
      db.prepare("INSERT INTO reviews (id, product_id, user_id, text, rating) VALUES ('r1', 'p1', 'u1', 'texto', 3)").run();
    }).not.toThrow();

    const review = db.prepare("SELECT sentiment FROM reviews WHERE id = 'r1'").get();
    expect(review.sentiment).toBeNull();
  });

  test('deve rejeitar email duplicado na tabela users', () => {
    db = getTestDb();

    db.prepare("INSERT INTO users (id, name, email, password_hash) VALUES ('u1', 'User 1', 'same@test.com', 'hash1')").run();

    expect(() => {
      db.prepare("INSERT INTO users (id, name, email, password_hash) VALUES ('u2', 'User 2', 'same@test.com', 'hash2')").run();
    }).toThrow();
  });

  test('deve rejeitar product_id duplicado na tabela product_insights', () => {
    db = getTestDb();

    db.prepare("INSERT INTO users (id, name, email, password_hash) VALUES ('u1', 'Test', 'test@test.com', 'hash')").run();
    db.prepare("INSERT INTO products (id, name, description, category, created_by) VALUES ('p1', 'Prod', 'Desc', 'Cat', 'u1')").run();

    db.prepare("INSERT INTO product_insights (id, product_id) VALUES ('i1', 'p1')").run();

    expect(() => {
      db.prepare("INSERT INTO product_insights (id, product_id) VALUES ('i2', 'p1')").run();
    }).toThrow();
  });

  test('deve retornar instâncias independentes a cada chamada', () => {
    const db1 = getTestDb();
    const db2 = getTestDb();

    expect(db1).not.toBe(db2);

    db1.close();
    db2.close();
    db = null; // evita double-close no afterEach
  });
});

describe('connection — getDb / closeDb (singleton)', () => {
  afterEach(() => {
    closeDb();
  });

  test('deve retornar a mesma instância em chamadas consecutivas', () => {
    const db1 = getDb();
    const db2 = getDb();
    expect(db1).toBe(db2);
  });

  test('closeDb deve fechar a conexão e permitir reabrir', () => {
    const db1 = getDb();
    expect(db1.open).toBe(true);

    closeDb();

    // Após fechar, uma nova chamada deve criar nova instância
    const db2 = getDb();
    expect(db2.open).toBe(true);
    expect(db2).not.toBe(db1);
  });

  test('closeDb sem conexão aberta não deve lançar erro', () => {
    expect(() => closeDb()).not.toThrow();
  });

  test('banco singleton deve ter schema aplicado', () => {
    const db = getDb();
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").all();
    const tableNames = tables.map((t) => t.name);

    expect(tableNames).toEqual(
      expect.arrayContaining(['users', 'products', 'reviews', 'product_insights'])
    );
  });
});
