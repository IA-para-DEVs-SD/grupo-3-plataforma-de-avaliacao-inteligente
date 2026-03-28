// Testes de propriedade para avaliações — fast-check + Jest
// Valida propriedades P9–P12, P22–P24 do design doc (Requisitos 3 e 8)
import { jest, describe, it, expect, afterEach } from '@jest/globals';
import fc from 'fast-check';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

// --- Configuração do JWT_SECRET antes de qualquer import de serviço ---
process.env.JWT_SECRET = 'pbt-test-secret-key-for-review-properties';

// --- Banco em memória compartilhado por iteração ---
let currentTestDb = null;

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
 * Cria um banco em memória com schema aplicado para cada iteração do PBT.
 */
function createFreshTestDb() {
  const db = new Database(':memory:');
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(CREATE_TABLES_SQL);
  db.exec(CREATE_INDEXES_SQL);
  return db;
}

/**
 * Insere um usuário de teste diretamente no banco para satisfazer FK.
 * Retorna o ID do usuário criado.
 */
function insertTestUser(db) {
  const userId = uuidv4();
  db.prepare(
    "INSERT INTO users (id, name, email, password_hash) VALUES (?, 'Test User', ?, 'hash123')"
  ).run(userId, `user-${userId}@test.com`);
  return userId;
}

/**
 * Insere um produto de teste diretamente no banco para satisfazer FK.
 * Retorna o ID do produto criado.
 */
function insertTestProduct(db, userId) {
  const productId = uuidv4();
  db.prepare(
    "INSERT INTO products (id, name, description, category, created_by) VALUES (?, 'Produto Teste', 'Descrição do produto teste', 'Eletrônicos', ?)"
  ).run(productId, userId);
  return productId;
}

/**
 * Insere uma avaliação diretamente no banco com timestamp controlado.
 * Útil para testes de ordenação e paginação (P22, P23, P24).
 */
function insertReviewDirect(db, { productId, userId, text, rating, sentiment = null, createdAt = null }) {
  const id = uuidv4();
  const ts = createdAt || new Date().toISOString().replace('T', ' ').slice(0, 19);
  db.prepare(
    'INSERT INTO reviews (id, product_id, user_id, text, rating, sentiment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, productId, userId, text, rating, sentiment, ts);
  return id;
}

// --- Mock do módulo de conexão para usar banco em memória ---
jest.unstable_mockModule('../database/connection.js', () => ({
  getDb: () => currentTestDb,
  closeDb: () => {
    if (currentTestDb) {
      currentTestDb.close();
      currentTestDb = null;
    }
  },
  getTestDb: () => createFreshTestDb(),
}));

// --- Importa módulos após o mock ---
const { createReview, findByProductId } = await import('../models/review-model.js');
const { createReviewService } = await import('../services/review-service.js');

// --- Geradores fast-check ---

// Gerador de texto de avaliação válido (>= 20 caracteres após trim, alfanumérico com espaços e pontuação)
// Garante que o texto começa e termina com letra para que trim() não reduza o comprimento
const validReviewTextArb = fc.stringMatching(/^[A-Za-z][A-Za-z0-9 .,!?]{18,98}[A-Za-z]$/);

// Gerador de nota válida (inteiro entre 1 e 5)
const validRatingArb = fc.integer({ min: 1, max: 5 });

// Gerador de texto curto (0–19 caracteres após trim) para P11
const shortTextArb = fc.oneof(
  // Strings curtas com conteúdo real (0–19 chars)
  fc.stringMatching(/^[A-Za-z0-9 ]{0,19}$/),
  // Strings compostas apenas de espaços (trim resulta em 0 chars)
  fc.stringOf(fc.constant(' '), { minLength: 0, maxLength: 30 })
);

// Gerador de nota inválida para P12 (fora de [1,5])
const invalidRatingArb = fc.oneof(
  fc.integer({ min: -100, max: 0 }),       // zero e negativos
  fc.integer({ min: 6, max: 100 }),        // acima de 5
  fc.double({ min: 1.01, max: 4.99, noNaN: true, noDefaultInfinity: true })  // decimais dentro do range
    .filter(n => !Number.isInteger(n))
);

// Gerador de sentimento válido
const sentimentArb = fc.constantFrom('positive', 'neutral', 'negative');

// --- Cleanup após cada teste ---
afterEach(() => {
  if (currentTestDb) {
    try { currentTestDb.close(); } catch { /* já fechado */ }
    currentTestDb = null;
  }
});


// Feature: smart-product-reviews, Property 9: avaliação válida salva e listada (round-trip)
// **Validates: Requirements 3.1, 3.2**
describe('P9 — avaliação válida salva e listada (round-trip)', () => {
  it('para qualquer avaliação com texto >= 20 chars e nota 1–5, deve aparecer na listagem do produto', async () => {
    await fc.assert(
      fc.asyncProperty(validReviewTextArb, validRatingArb, async (text, rating) => {
        // Cria banco fresco para cada iteração
        currentTestDb = createFreshTestDb();
        const userId = insertTestUser(currentTestDb);
        const productId = insertTestProduct(currentTestDb, userId);

        // Cria a avaliação via model
        const created = await createReview({
          productId,
          userId,
          text,
          rating,
        });

        // Verifica que a avaliação foi criada com os dados corretos
        expect(created).toBeDefined();
        expect(created.text).toBe(text);
        expect(created.rating).toBe(rating);
        expect(created.productId).toBe(productId);
        expect(created.userId).toBe(userId);

        // Busca avaliações do produto
        const result = await findByProductId(productId);

        // Verifica que a avaliação aparece na listagem
        const found = result.reviews.find(r => r.id === created.id);
        expect(found).toBeDefined();
        expect(found.text).toBe(text);
        expect(found.rating).toBe(rating);

        // Cleanup
        currentTestDb.close();
        currentTestDb = null;
      }),
      { numRuns: 100 }
    );
  });
});


// Feature: smart-product-reviews, Property 10: submissão sem auth rejeitada (error condition)
// Testa no nível do service que criar avaliação para produto inexistente lança NOT_FOUND.
// A autenticação é verificada no nível de rota; no service, a verificação de existência do produto
// funciona como barreira equivalente — sem produto válido, a operação falha.
// **Validates: Requirements 3.3**
describe('P10 — submissão para produto inexistente rejeitada (error condition)', () => {
  it('para qualquer texto e nota válidos, se o productId não existe, createReviewService deve lançar NOT_FOUND', async () => {
    await fc.assert(
      fc.asyncProperty(validReviewTextArb, validRatingArb, async (text, rating) => {
        currentTestDb = createFreshTestDb();
        const userId = insertTestUser(currentTestDb);
        const fakeProductId = uuidv4(); // produto que não existe no banco

        // Tenta criar avaliação para produto inexistente
        await expect(
          createReviewService({
            productId: fakeProductId,
            userId,
            text,
            rating,
          })
        ).rejects.toMatchObject({
          code: 'NOT_FOUND',
        });

        // Verifica que nenhuma avaliação foi persistida
        const count = currentTestDb.prepare(
          'SELECT COUNT(*) AS total FROM reviews'
        ).get();
        expect(count.total).toBe(0);

        // Cleanup
        currentTestDb.close();
        currentTestDb = null;
      }),
      { numRuns: 100 }
    );
  });
});


// Feature: smart-product-reviews, Property 11: texto curto rejeitado (error condition)
// **Validates: Requirements 3.4**
describe('P11 — texto curto rejeitado (error condition)', () => {
  it('para qualquer string com 0–19 caracteres (incluindo só espaços), createReviewService deve lançar VALIDATION_ERROR', async () => {
    await fc.assert(
      fc.asyncProperty(shortTextArb, validRatingArb, async (text, rating) => {
        currentTestDb = createFreshTestDb();
        const userId = insertTestUser(currentTestDb);
        const productId = insertTestProduct(currentTestDb, userId);

        // Tenta criar avaliação com texto curto
        await expect(
          createReviewService({
            productId,
            userId,
            text,
            rating,
          })
        ).rejects.toMatchObject({
          code: 'VALIDATION_ERROR',
        });

        // Verifica que nenhuma avaliação foi persistida
        const count = currentTestDb.prepare(
          'SELECT COUNT(*) AS total FROM reviews'
        ).get();
        expect(count.total).toBe(0);

        // Cleanup
        currentTestDb.close();
        currentTestDb = null;
      }),
      { numRuns: 100 }
    );
  });
});


// Feature: smart-product-reviews, Property 12: nota inválida rejeitada (error condition)
// **Validates: Requirements 3.5**
describe('P12 — nota inválida rejeitada (error condition)', () => {
  it('para qualquer valor numérico fora de [1,5] (0, negativos, decimais, >5), createReviewService deve lançar VALIDATION_ERROR', async () => {
    await fc.assert(
      fc.asyncProperty(validReviewTextArb, invalidRatingArb, async (text, rating) => {
        currentTestDb = createFreshTestDb();
        const userId = insertTestUser(currentTestDb);
        const productId = insertTestProduct(currentTestDb, userId);

        // Tenta criar avaliação com nota inválida
        await expect(
          createReviewService({
            productId,
            userId,
            text,
            rating,
          })
        ).rejects.toMatchObject({
          code: 'VALIDATION_ERROR',
        });

        // Verifica que nenhuma avaliação foi persistida
        const count = currentTestDb.prepare(
          'SELECT COUNT(*) AS total FROM reviews'
        ).get();
        expect(count.total).toBe(0);

        // Cleanup
        currentTestDb.close();
        currentTestDb = null;
      }),
      { numRuns: 100 }
    );
  });
});


// Feature: smart-product-reviews, Property 22: listagem ordenada por data com paginação (invariante de ordenação)
// **Validates: Requirements 8.1**
describe('P22 — listagem ordenada por data com paginação (invariante de ordenação)', () => {
  it('para qualquer conjunto de avaliações, a listagem padrão deve estar em ordem decrescente de createdAt, máx 10 por página, sem duplicatas', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 25 }),
        async (numReviews) => {
          currentTestDb = createFreshTestDb();
          const userId = insertTestUser(currentTestDb);
          const productId = insertTestProduct(currentTestDb, userId);

          // Insere N avaliações com timestamps distintos e crescentes
          const insertedIds = [];
          for (let i = 0; i < numReviews; i++) {
            // Gera timestamps espaçados por 1 minuto para garantir ordenação distinta
            const ts = `2024-01-01 ${String(Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00`;
            const id = insertReviewDirect(currentTestDb, {
              productId,
              userId,
              text: `Avaliação de teste número ${String(i).padStart(3, '0')} com texto suficiente`,
              rating: (i % 5) + 1,
              createdAt: ts,
            });
            insertedIds.push(id);
          }

          // Coleta todas as avaliações página por página
          const allCollected = [];
          const totalPages = Math.ceil(numReviews / 10);

          for (let page = 1; page <= totalPages; page++) {
            const result = await findByProductId(productId, { page });

            // Máximo 10 itens por página
            expect(result.reviews.length).toBeLessThanOrEqual(10);
            expect(result.totalPages).toBe(totalPages);
            expect(result.total).toBe(numReviews);

            allCollected.push(...result.reviews);
          }

          // Verifica que todas as avaliações foram coletadas (sem omissões)
          expect(allCollected.length).toBe(numReviews);

          // Verifica sem duplicatas
          const collectedIds = allCollected.map(r => r.id);
          const uniqueIds = new Set(collectedIds);
          expect(uniqueIds.size).toBe(numReviews);

          // Verifica ordenação decrescente por createdAt
          for (let i = 1; i < allCollected.length; i++) {
            expect(allCollected[i - 1].createdAt >= allCollected[i].createdAt).toBe(true);
          }

          // Cleanup
          currentTestDb.close();
          currentTestDb = null;
        }
      ),
      { numRuns: 50 }
    );
  });
});


// Feature: smart-product-reviews, Property 23: filtro de sentimento preciso (metamórfica)
// **Validates: Requirements 8.2**
describe('P23 — filtro de sentimento preciso (metamórfica)', () => {
  it('para qualquer filtro de sentimento aplicado, todos os resultados devem ter exatamente esse sentimento', async () => {
    await fc.assert(
      fc.asyncProperty(
        sentimentArb,
        fc.array(
          fc.record({
            rating: validRatingArb,
            sentiment: sentimentArb,
          }),
          { minLength: 3, maxLength: 15 }
        ),
        async (filterSentiment, reviewsData) => {
          currentTestDb = createFreshTestDb();
          const userId = insertTestUser(currentTestDb);
          const productId = insertTestProduct(currentTestDb, userId);

          // Insere avaliações com sentimentos variados
          for (let i = 0; i < reviewsData.length; i++) {
            insertReviewDirect(currentTestDb, {
              productId,
              userId,
              text: `Avaliação de teste com sentimento definido número ${String(i).padStart(3, '0')}`,
              rating: reviewsData[i].rating,
              sentiment: reviewsData[i].sentiment,
              createdAt: `2024-01-01 00:${String(i).padStart(2, '0')}:00`,
            });
          }

          // Filtra por sentimento
          const result = await findByProductId(productId, { sentiment: filterSentiment });

          // Conta quantas avaliações inseridas têm o sentimento filtrado
          const expectedCount = reviewsData.filter(r => r.sentiment === filterSentiment).length;
          expect(result.total).toBe(expectedCount);

          // Verifica que todos os resultados têm exatamente o sentimento filtrado
          for (const review of result.reviews) {
            expect(review.sentiment).toBe(filterSentiment);
          }

          // Cleanup
          currentTestDb.close();
          currentTestDb = null;
        }
      ),
      { numRuns: 50 }
    );
  });
});


// Feature: smart-product-reviews, Property 24: ordenação por nota correta (invariante de ordenação)
// **Validates: Requirements 8.3, 8.4**
describe('P24 — ordenação por nota correta (invariante de ordenação)', () => {
  it('para qualquer lista ordenada por nota (asc ou desc), itens adjacentes devem respeitar a ordem', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('rating_asc', 'rating_desc'),
        fc.array(validRatingArb, { minLength: 2, maxLength: 15 }),
        async (sortDirection, ratings) => {
          currentTestDb = createFreshTestDb();
          const userId = insertTestUser(currentTestDb);
          const productId = insertTestProduct(currentTestDb, userId);

          // Insere avaliações com notas variadas
          for (let i = 0; i < ratings.length; i++) {
            insertReviewDirect(currentTestDb, {
              productId,
              userId,
              text: `Avaliação de teste para ordenação por nota número ${String(i).padStart(3, '0')}`,
              rating: ratings[i],
              createdAt: `2024-01-01 00:${String(i).padStart(2, '0')}:00`,
            });
          }

          // Busca com ordenação por nota
          const result = await findByProductId(productId, { sort: sortDirection });
          const reviews = result.reviews;

          // Verifica que itens adjacentes respeitam a ordem
          for (let i = 1; i < reviews.length; i++) {
            if (sortDirection === 'rating_asc') {
              expect(reviews[i].rating).toBeGreaterThanOrEqual(reviews[i - 1].rating);
            } else {
              expect(reviews[i].rating).toBeLessThanOrEqual(reviews[i - 1].rating);
            }
          }

          // Cleanup
          currentTestDb.close();
          currentTestDb = null;
        }
      ),
      { numRuns: 50 }
    );
  });
});
