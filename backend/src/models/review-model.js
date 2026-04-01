// Modelo de avaliação — operações CRUD na tabela reviews
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/connection.js';

/** Quantidade de itens por página na listagem paginada */
const PAGE_SIZE = 10;

/**
 * Cria uma nova avaliação no banco de dados.
 * Gera UUID automaticamente. O sentimento começa como null (será processado pela IA).
 * @param {{ productId: string, userId: string, text: string, rating: number }} dados da avaliação
 * @returns {Promise<object>} avaliação criada
 */
export async function createReview({ productId, userId, text, rating }) {
  const db = getDb();
  const id = uuidv4();

  db.prepare(
    'INSERT INTO reviews (id, product_id, user_id, text, rating) VALUES (?, ?, ?, ?, ?)'
  ).run(id, productId, userId, text, rating);

  // Retorna a avaliação recém-criada
  const review = db.prepare(
    `SELECT id, product_id AS productId, user_id AS userId, text, rating,
            sentiment, sentiment_processed_at AS sentimentProcessedAt,
            created_at AS createdAt
     FROM reviews WHERE id = ?`
  ).get(id);

  return review;
}

/**
 * Busca avaliações de um produto com filtro de sentimento, ordenação e paginação.
 * @param {string} productId — ID do produto
 * @param {{ sentiment?: string, sort?: string, page?: number, pattern?: string }} options — opções de filtro
 * @returns {Promise<{ reviews: object[], total: number, page: number, totalPages: number }>}
 */
export async function findByProductId(productId, options = {}) {
  const db = getDb();
  const { sentiment, sort, page = 1, pattern, rating } = options;

  // Monta cláusulas WHERE dinâmicas
  const conditions = ['product_id = ?'];
  const params = [productId];

  if (sentiment) {
    conditions.push('sentiment = ?');
    params.push(sentiment);
  }

  if (rating) {
    const ratingNum = parseInt(rating, 10);
    if (ratingNum >= 1 && ratingNum <= 5) {
      conditions.push('rating = ?');
      params.push(ratingNum);
    }
  }

  if (pattern) {
    conditions.push('text LIKE ?');
    params.push(`%${pattern}%`);
  }

  const whereClause = conditions.join(' AND ');

  // Conta total de registros com os filtros aplicados
  const countRow = db.prepare(
    `SELECT COUNT(*) AS total FROM reviews WHERE ${whereClause}`
  ).get(...params);
  const total = countRow.total;

  // Define ordenação
  let orderClause = 'created_at DESC'; // padrão: mais recentes primeiro
  if (sort === 'rating_asc') {
    orderClause = 'rating ASC, created_at DESC';
  } else if (sort === 'rating_desc') {
    orderClause = 'rating DESC, created_at DESC';
  }

  // Calcula offset para paginação
  const offset = (page - 1) * PAGE_SIZE;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const reviews = db.prepare(
    `SELECT id, product_id AS productId, user_id AS userId, text, rating,
            sentiment, sentiment_processed_at AS sentimentProcessedAt,
            created_at AS createdAt
     FROM reviews
     WHERE ${whereClause}
     ORDER BY ${orderClause}
     LIMIT ? OFFSET ?`
  ).all(...params, PAGE_SIZE, offset);

  return { reviews, total, page, totalPages };
}

/**
 * Busca uma avaliação pelo ID.
 * @param {string} id
 * @returns {Promise<object | null>}
 */
export async function findById(id) {
  const db = getDb();

  const review = db.prepare(
    `SELECT id, product_id AS productId, user_id AS userId, text, rating,
            sentiment, sentiment_processed_at AS sentimentProcessedAt,
            created_at AS createdAt
     FROM reviews WHERE id = ?`
  ).get(id);

  return review || null;
}

/**
 * Atualiza o sentimento e a data de processamento de uma avaliação.
 * @param {string} id — ID da avaliação
 * @param {string} sentiment — 'positive', 'neutral' ou 'negative'
 * @returns {Promise<object | null>} avaliação atualizada ou null se não encontrada
 */
export async function updateSentiment(id, sentiment) {
  const db = getDb();

  const result = db.prepare(
    `UPDATE reviews SET sentiment = ?, sentiment_processed_at = datetime('now') WHERE id = ?`
  ).run(sentiment, id);

  if (result.changes === 0) return null;

  return findById(id);
}

/**
 * Conta o número de avaliações de um produto.
 * @param {string} productId
 * @returns {Promise<number>}
 */
export async function countByProductId(productId) {
  const db = getDb();

  const row = db.prepare(
    'SELECT COUNT(*) AS count FROM reviews WHERE product_id = ?'
  ).get(productId);

  return row.count;
}

/**
 * Retorna TODAS as avaliações de um produto (sem paginação).
 * Usado para processamento de IA que precisa de todas as avaliações.
 * @param {string} productId
 * @returns {Promise<object[]>}
 */
export async function findAllByProductId(productId) {
  const db = getDb();

  return db.prepare(
    `SELECT id, product_id AS productId, user_id AS userId, text, rating,
            sentiment, sentiment_processed_at AS sentimentProcessedAt,
            created_at AS createdAt
     FROM reviews
     WHERE product_id = ?
     ORDER BY created_at DESC`
  ).all(productId);
}
