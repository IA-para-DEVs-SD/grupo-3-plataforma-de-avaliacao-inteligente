// Serviço de avaliações — validação de dados e orquestração do model
import { createReview, findByProductId, findById, updateSentiment } from '../models/review-model.js';
import { findById as findProductById } from '../models/product-model.js';
import { AppError } from '../middleware/error-middleware.js';
import { enqueue } from '../ai-engine/ai-queue.js';
import { analyzeSentiment } from '../ai-engine/sentiment-analyzer.js';
import { detectSpam } from '../ai-engine/spam-detector.js';
import {
  recalculateSentimentDistribution,
  recalculateScore,
  regenerateSummary,
  reanalyzePatterns,
} from './insight-service.js';

/** Comprimento mínimo do texto da avaliação (após trim) */
const MIN_TEXT_LENGTH = 20;

/** Nota mínima permitida */
const MIN_RATING = 1;

/** Nota máxima permitida */
const MAX_RATING = 5;

/**
 * Cria uma nova avaliação após validar os campos obrigatórios.
 * Lança VALIDATION_ERROR se texto ou nota forem inválidos.
 * Lança NOT_FOUND se o produto não existir.
 * @param {{ productId: string, userId: string, text: string, rating: number }} dados da avaliação
 * @returns {Promise<object>} Avaliação criada
 * @throws {AppError} VALIDATION_ERROR se campos forem inválidos, NOT_FOUND se produto não existir
 */
export async function createReviewService({ productId, userId, text, rating }) {
  const errors = [];

  // Valida texto: mínimo 20 caracteres após trim
  if (!text || typeof text !== 'string' || text.trim().length < MIN_TEXT_LENGTH) {
    errors.push({
      field: 'text',
      message: `Texto da avaliação deve ter no mínimo ${MIN_TEXT_LENGTH} caracteres`,
    });
  }

  // Valida nota: inteiro entre 1 e 5
  if (
    rating === undefined ||
    rating === null ||
    typeof rating !== 'number' ||
    !Number.isInteger(rating) ||
    rating < MIN_RATING ||
    rating > MAX_RATING
  ) {
    errors.push({
      field: 'rating',
      message: `Nota deve ser um número inteiro entre ${MIN_RATING} e ${MAX_RATING}`,
    });
  }

  if (errors.length > 0) {
    throw new AppError('VALIDATION_ERROR', 'Dados da avaliação inválidos', errors);
  }

  // Verifica se o produto existe
  const product = await findProductById(productId);
  if (!product) {
    throw new AppError('NOT_FOUND', 'Produto não encontrado');
  }

  // Cria a avaliação no banco
  const review = await createReview({
    productId,
    userId,
    text: text.trim(),
    rating,
  });

  // Verifica spam antes de enfileirar (assíncrono, não bloqueia)
  const spamCheck = await detectSpam(text.trim(), rating);
  if (spamCheck.suspicious) {
    console.warn(`[SpamDetector] Avaliação suspeita (${review.id}): ${spamCheck.reason}`);
    // Marca como suspeita mas não bloqueia — moderação futura pode usar esse flag
  }

  // Enfileira pipeline completo de IA (não bloqueia a resposta)
  enqueue({
    handler: async (data) => {
      // 1. Analisa sentimento e atualiza a avaliação
      const sentiment = await analyzeSentiment(data.text);
      await updateSentiment(data.reviewId, sentiment);

      // 2. Recalcula distribuição de sentimento
      await recalculateSentimentDistribution(data.productId);

      // 3. Recalcula score inteligente (threshold: 3 avaliações, SLA: 30s)
      await recalculateScore(data.productId);

      // 4. Regenera resumo automático (threshold: 5 avaliações, SLA: 60s)
      await regenerateSummary(data.productId);

      // 5. Reanalisa padrões recorrentes (threshold: 10 avaliações, SLA: 120s)
      await reanalyzePatterns(data.productId);
    },
    data: { reviewId: review.id, text: review.text, productId },
  });

  return review;
}

/**
 * Busca avaliações de um produto com filtros e paginação.
 * @param {string} productId — ID do produto
 * @param {{ sentiment?: string, sort?: string, page?: number, pattern?: string }} options — opções de filtro
 * @returns {Promise<{ reviews: object[], total: number, page: number, totalPages: number }>}
 */
export async function getReviewsByProduct(productId, options = {}) {
  const result = await findByProductId(productId, options);
  return result;
}
/**
 * Busca uma avaliação pelo ID.
 * Lança NOT_FOUND se a avaliação não existir.
 * @param {string} id — ID da avaliação
 * @returns {Promise<object>} Avaliação encontrada
 * @throws {AppError} NOT_FOUND se a avaliação não existir
 */
export async function getReviewById(id) {
  const review = await findById(id);

  if (!review) {
    throw new AppError('NOT_FOUND', 'Avaliação não encontrada');
  }

  return review;
}
