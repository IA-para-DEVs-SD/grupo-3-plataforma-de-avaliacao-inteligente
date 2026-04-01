// Serviço de insights — orquestra o motor de IA e persiste resultados
import { findAllByProductId } from '../models/review-model.js';
import { upsertInsight, findByProductId } from '../models/product-insight-model.js';
import { generateSummary } from '../ai-engine/summary-generator.js';
import { detectPatterns } from '../ai-engine/pattern-detector.js';
import { calculateSmartScore } from '../ai-engine/score-calculator.js';
import { explainScore } from '../ai-engine/score-explainer.js';
import { getCached, setCached, invalidate } from './insight-cache.js';

/** Threshold mínimo de avaliações para gerar resumo automático */
const SUMMARY_THRESHOLD = 5;

/** Threshold mínimo de avaliações para detectar padrões */
const PATTERN_THRESHOLD = 10;

/** Threshold mínimo de avaliações para calcular score inteligente */
const SCORE_THRESHOLD = 3;

/**
 * Recalcula a distribuição de sentimento de um produto.
 * Busca todas as avaliações, conta sentimentos classificados e calcula percentuais.
 * Atualiza o ProductInsight com a nova distribuição.
 * @param {string} productId — ID do produto
 * @returns {Promise<object | null>} insight atualizado ou null se não houver avaliações classificadas
 */
export async function recalculateSentimentDistribution(productId) {
  const reviews = await findAllByProductId(productId);

  // Filtra apenas avaliações com sentimento classificado
  const classified = reviews.filter((r) => r.sentiment != null);

  if (classified.length === 0) {
    return null;
  }

  let positive = 0;
  let neutral = 0;
  let negative = 0;

  for (const review of classified) {
    if (review.sentiment === 'positive') positive += 1;
    else if (review.sentiment === 'neutral') neutral += 1;
    else if (review.sentiment === 'negative') negative += 1;
  }

  const total = classified.length;
  const distribution = {
    positive: Math.round((positive / total) * 1000) / 10,
    neutral: Math.round((neutral / total) * 1000) / 10,
    negative: Math.round((negative / total) * 1000) / 10,
  };

  // Ajusta arredondamento para garantir soma = 100%
  const sum = distribution.positive + distribution.neutral + distribution.negative;
  if (sum !== 100) {
    const diff = 100 - sum;
    // Aplica a diferença ao maior valor
    const max = Math.max(distribution.positive, distribution.neutral, distribution.negative);
    if (distribution.positive === max) distribution.positive += diff;
    else if (distribution.neutral === max) distribution.neutral += diff;
    else distribution.negative += diff;

    // Arredonda novamente para 1 casa decimal
    distribution.positive = Math.round(distribution.positive * 10) / 10;
    distribution.neutral = Math.round(distribution.neutral * 10) / 10;
    distribution.negative = Math.round(distribution.negative * 10) / 10;
  }

  const insight = await upsertInsight(productId, {
    sentimentDistribution: distribution,
    reviewCountAtLastUpdate: reviews.length,
  });

  invalidate(productId);
  return insight;
}

/**
 * Retorna o insight de um produto (ou null se não existir).
 * Usa cache em memória para evitar leituras desnecessárias ao banco.
 * @param {string} productId — ID do produto
 * @returns {Promise<object | null>}
 */
export async function getInsights(productId) {
  const cached = getCached(productId);
  if (cached) return cached;

  const insight = await findByProductId(productId);
  if (insight) setCached(productId, insight);
  return insight;
}

/**
 * Regenera o resumo automático de um produto.
 * Só gera se o produto tiver >= 5 avaliações classificadas.
 * @param {string} productId — ID do produto
 * @returns {Promise<object | null>} insight atualizado ou null se abaixo do threshold
 */
export async function regenerateSummary(productId) {
  const reviews = await findAllByProductId(productId);

  if (reviews.length < SUMMARY_THRESHOLD) {
    return null;
  }

  // Filtra avaliações com sentimento classificado para o resumo
  const classified = reviews.filter((r) => r.sentiment != null);
  const summary = generateSummary(classified);

  const insight = await upsertInsight(productId, {
    summary: JSON.stringify(summary),
    reviewCountAtLastUpdate: reviews.length,
  });

  invalidate(productId);
  return insight;
}

/**
 * Reanalisa padrões recorrentes de um produto.
 * Só analisa se o produto tiver >= 10 avaliações classificadas.
 * @param {string} productId — ID do produto
 * @returns {Promise<object | null>} insight atualizado ou null se abaixo do threshold
 */
export async function reanalyzePatterns(productId) {
  const reviews = await findAllByProductId(productId);

  if (reviews.length < PATTERN_THRESHOLD) {
    return null;
  }

  // Filtra avaliações com sentimento classificado para detecção de padrões
  const classified = reviews.filter((r) => r.sentiment != null);
  const patterns = detectPatterns(classified);

  const insight = await upsertInsight(productId, {
    patterns,
    reviewCountAtLastUpdate: reviews.length,
  });

  invalidate(productId);
  return insight;
}

/**
 * Recalcula o score inteligente e a média simples de um produto.
 * Só calcula se o produto tiver >= 3 avaliações.
 * @param {string} productId — ID do produto
 * @returns {Promise<object | null>} insight atualizado ou null se abaixo do threshold
 */
export async function recalculateScore(productId) {
  const reviews = await findAllByProductId(productId);

  if (reviews.length < SCORE_THRESHOLD) {
    return null;
  }

  // Calcula média simples
  const ratingSum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  const simpleAverage = Math.round((ratingSum / reviews.length) * 10) / 10;

  // Busca insight atual para obter distribuição de sentimento
  const currentInsight = await findByProductId(productId);
  const sentimentDistribution = currentInsight?.sentimentDistribution || null;
  const patterns = currentInsight?.patterns || null;

  const smartScore = calculateSmartScore(reviews, sentimentDistribution, patterns);

  // Gera explicação do score via Ollama (assíncrono, não bloqueia)
  const scoreExplanation = await explainScore(
    smartScore.score,
    smartScore.confidence,
    sentimentDistribution,
    patterns,
    reviews.length
  );

  const insight = await upsertInsight(productId, {
    smartScore: smartScore.score,
    smartScoreConfidence: smartScore.confidence,
    scoreExplanation,
    simpleAverage,
    reviewCountAtLastUpdate: reviews.length,
  });

  invalidate(productId);
  return insight;
}
