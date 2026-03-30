// Modelo de insights de produto — operações na tabela product_insights
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/connection.js';

/**
 * Insere ou atualiza o insight de um produto.
 * Se já existir um registro para o productId, atualiza os campos fornecidos.
 * @param {string} productId — ID do produto
 * @param {object} data — campos a atualizar
 * @param {string} [data.summary] — resumo automático
 * @param {object} [data.patterns] — padrões recorrentes (será serializado como JSON)
 * @param {number} [data.smartScore] — score inteligente
 * @param {number} [data.simpleAverage] — média simples
 * @param {object} [data.sentimentDistribution] — distribuição de sentimento (será serializado como JSON)
 * @param {number} [data.reviewCountAtLastUpdate] — contagem de avaliações no momento da atualização
 * @returns {Promise<object>} insight atualizado
 */
export async function upsertInsight(productId, data) {
  const db = getDb();

  const existing = db
    .prepare('SELECT id FROM product_insights WHERE product_id = ?')
    .get(productId);

  const patterns = data.patterns !== null ? JSON.stringify(data.patterns) : undefined;
  const sentimentDistribution =
    data.sentimentDistribution !== null ? JSON.stringify(data.sentimentDistribution) : undefined;

  if (existing) {
    // Atualiza apenas os campos fornecidos
    const updates = [];
    const params = [];

    if (data.summary !== undefined) {
      updates.push('summary = ?');
      params.push(data.summary);
    }
    if (patterns !== undefined) {
      updates.push('patterns = ?');
      params.push(patterns);
    }
    if (data.smartScore !== undefined) {
      updates.push('smart_score = ?');
      params.push(data.smartScore);
    }
    if (data.simpleAverage !== undefined) {
      updates.push('simple_average = ?');
      params.push(data.simpleAverage);
    }
    if (sentimentDistribution !== undefined) {
      updates.push('sentiment_distribution = ?');
      params.push(sentimentDistribution);
    }
    if (data.reviewCountAtLastUpdate !== undefined) {
      updates.push('review_count_at_last_update = ?');
      params.push(data.reviewCountAtLastUpdate);
    }

    // Sempre atualiza o timestamp
    updates.push("updated_at = datetime('now')");

    if (updates.length > 0) {
      db.prepare(`UPDATE product_insights SET ${updates.join(', ')} WHERE product_id = ?`).run(
        ...params,
        productId
      );
    }
  } else {
    // Insere novo registro
    const id = uuidv4();
    db.prepare(
      `INSERT INTO product_insights (id, product_id, summary, patterns, smart_score, simple_average, sentiment_distribution, review_count_at_last_update)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      productId,
      data.summary || null,
      patterns || null,
      data.smartScore ?? null,
      data.simpleAverage ?? null,
      sentimentDistribution || null,
      data.reviewCountAtLastUpdate ?? 0
    );
  }

  return findByProductId(productId);
}

/**
 * Busca o insight de um produto pelo ID do produto.
 * Retorna o objeto com campos JSON já parseados, ou null se não existir.
 * @param {string} productId — ID do produto
 * @returns {Promise<object | null>}
 */
export async function findByProductId(productId) {
  const db = getDb();

  const row = db
    .prepare(
      `SELECT id, product_id AS productId, summary, patterns, smart_score AS smartScore,
            simple_average AS simpleAverage, sentiment_distribution AS sentimentDistribution,
            review_count_at_last_update AS reviewCountAtLastUpdate, updated_at AS updatedAt
     FROM product_insights WHERE product_id = ?`
    )
    .get(productId);

  if (!row) return null;

  // Parseia campos JSON
  return {
    ...row,
    patterns: row.patterns ? JSON.parse(row.patterns) : null,
    sentimentDistribution: row.sentimentDistribution ? JSON.parse(row.sentimentDistribution) : null,
  };
}
