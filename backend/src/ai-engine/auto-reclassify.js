// Reclassificação automática em background
// Quando o Ollama fica disponível, reclassifica avaliações que foram processadas
// pelo heurístico (identificadas pela ausência de sentiment_processed_at recente)

import { getDb } from '../database/connection.js';
import { isOllamaAvailable } from './ollama-client.js';
import { analyzeSentiment } from './sentiment-analyzer.js';

/** Intervalo de verificação de disponibilidade do Ollama (2 minutos) */
const CHECK_INTERVAL_MS = 2 * 60 * 1000;

/** Máximo de avaliações reclassificadas por ciclo (evita sobrecarga) */
const BATCH_SIZE = 10;

let isRunning = false;
let intervalId = null;

/**
 * Reclassifica um lote de avaliações usando o Ollama.
 * Importa os serviços de insight dinamicamente para evitar dependência circular.
 */
async function reclassifyBatch() {
  if (isRunning) return;
  isRunning = true;

  try {
    const available = await isOllamaAvailable();
    if (!available) return;

    const db = getDb();

    // Busca avaliações que nunca foram processadas pelo Ollama
    // (sentiment_processed_at nulo = nunca processadas, ou processadas há mais de 1 hora)
    const reviews = db.prepare(
      `SELECT id, product_id AS productId, text, sentiment
       FROM reviews
       WHERE sentiment_processed_at IS NULL
          OR sentiment_processed_at < datetime('now', '-1 hour')
       ORDER BY created_at DESC
       LIMIT ?`
    ).all(BATCH_SIZE);

    if (reviews.length === 0) return;

    console.log(`[AutoReclassify] Reclassificando ${reviews.length} avaliações com Ollama...`);

    const { recalculateSentimentDistribution, recalculateScore, regenerateSummary } =
      await import('../services/insight-service.js');

    const affectedProducts = new Set();
    let changed = 0;

    for (const review of reviews) {
      try {
        const newSentiment = await analyzeSentiment(review.text);

        db.prepare(
          `UPDATE reviews SET sentiment = ?, sentiment_processed_at = datetime('now') WHERE id = ?`
        ).run(newSentiment, review.id);

        if (newSentiment !== review.sentiment) {
          affectedProducts.add(review.productId);
          changed++;
        }
      } catch (err) {
        console.warn(`[AutoReclassify] Erro ao reclassificar review ${review.id}:`, err.message);
      }
    }

    // Recalcula insights dos produtos afetados
    for (const productId of affectedProducts) {
      try {
        await recalculateSentimentDistribution(productId);
        await recalculateScore(productId);
        await regenerateSummary(productId);
      } catch (err) {
        console.warn(`[AutoReclassify] Erro ao recalcular insights do produto ${productId}:`, err.message);
      }
    }

    if (changed > 0) {
      console.log(`[AutoReclassify] ${changed} avaliações reclassificadas, ${affectedProducts.size} produtos atualizados`);
    }
  } catch (err) {
    console.warn('[AutoReclassify] Erro no ciclo de reclassificação:', err.message);
  } finally {
    isRunning = false;
  }
}

/**
 * Inicia o serviço de reclassificação automática em background.
 * Verifica a cada 2 minutos se há avaliações para reclassificar.
 */
export function startAutoReclassify() {
  if (intervalId) return;

  // Executa imediatamente na inicialização (com delay de 30s para o servidor estabilizar)
  setTimeout(reclassifyBatch, 30 * 1000);

  intervalId = setInterval(reclassifyBatch, CHECK_INTERVAL_MS);
  console.log('[AutoReclassify] Serviço de reclassificação automática iniciado');
}

/**
 * Para o serviço de reclassificação automática.
 */
export function stopAutoReclassify() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
