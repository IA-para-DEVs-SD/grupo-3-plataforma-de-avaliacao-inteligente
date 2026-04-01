// Calculador de score inteligente ponderado com fator de confiança Bayesiano (v2)
// Combina nota base (50%), sentimento (30%) e recência (20%)
// Aplica fator de confiança: produtos com poucas avaliações convergem para a média da plataforma

/** Pesos para cada componente do score */
const WEIGHT_BASE_RATING = 0.5;
const WEIGHT_SENTIMENT = 0.3;
const WEIGHT_RECENCY = 0.2;

/** Escala máxima/mínima do score */
const MAX_SCORE = 10.0;
const MIN_SCORE = 0.0;

/**
 * Número mínimo de avaliações para o score ser considerado totalmente confiável.
 * Abaixo disso, o score é puxado em direção à média da plataforma (7.0).
 * Baseado na fórmula Bayesiana usada pelo IMDb.
 */
const CONFIDENCE_THRESHOLD = 20;

/** Score médio da plataforma usado como âncora Bayesiana */
const PLATFORM_AVERAGE_SCORE = 7.0;

/**
 * Calcula o componente de nota base: média das notas escalada para 0-10.
 * @param {Array<{ rating: number }>} reviews
 * @returns {number} score de nota base (0-10)
 */
function calculateBaseRating(reviews) {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  const avg = sum / reviews.length;
  return ((avg - 1) / 4) * MAX_SCORE;
}

/**
 * Calcula o componente de sentimento: diferença entre positivos e negativos, escalada para 0-10.
 * @param {{ positive: number, negative: number } | null} distribution
 * @returns {number} score de sentimento (0-10)
 */
function calculateSentimentScore(distribution) {
  if (!distribution) return 5.0;
  const diff = (distribution.positive - distribution.negative) / 100;
  return ((diff + 1) / 2) * MAX_SCORE;
}

/**
 * Calcula o componente de recência: média ponderada com decaimento linear.
 * Avaliações mais recentes recebem peso maior.
 * @param {Array<{ rating: number, createdAt: string }>} reviews
 * @returns {number} score de recência (0-10)
 */
function calculateRecencyScore(reviews) {
  if (reviews.length === 0) return 0;

  const sorted = [...reviews].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  let weightedSum = 0;
  let totalWeight = 0;

  for (let i = 0; i < sorted.length; i++) {
    const weight = sorted.length - i;
    weightedSum += (sorted[i].rating || 0) * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;
  const weightedAvg = weightedSum / totalWeight;
  return ((weightedAvg - 1) / 4) * MAX_SCORE;
}

/**
 * Aplica fator de confiança Bayesiano ao score calculado.
 * Produtos com poucas avaliações têm o score puxado em direção à média da plataforma,
 * evitando que 3 avaliações nota 10 gerem um score mais alto que 200 avaliações nota 8.
 *
 * Fórmula: score_final = (n / (n + m)) * score + (m / (n + m)) * C
 * Onde: n = número de avaliações, m = threshold de confiança, C = média da plataforma
 *
 * @param {number} rawScore — score calculado pelos componentes
 * @param {number} reviewCount — número de avaliações do produto
 * @returns {{ score: number, confidence: number }} score ajustado e percentual de confiança (0-100)
 */
function applyConfidenceFactor(rawScore, reviewCount) {
  const n = reviewCount;
  const m = CONFIDENCE_THRESHOLD;
  const C = PLATFORM_AVERAGE_SCORE;

  // Peso do score real vs peso da média da plataforma
  const realWeight = n / (n + m);
  const priorWeight = m / (n + m);

  const adjustedScore = realWeight * rawScore + priorWeight * C;

  // Percentual de confiança: 0% com 0 avaliações, 100% com >= CONFIDENCE_THRESHOLD
  const confidence = Math.min(100, Math.round((n / m) * 100));

  return {
    score: Math.round(adjustedScore * 10) / 10,
    confidence,
  };
}

/**
 * Calcula o score inteligente ponderado com fator de confiança Bayesiano.
 * Retorna o score ajustado e o percentual de confiança para exibição no frontend.
 *
 * @param {Array<{ rating: number, createdAt: string }>} reviews
 * @param {{ positive: number, neutral: number, negative: number } | null} sentimentDistribution
 * @param {{ strengths: string[], weaknesses: string[] } | null} patterns
 * @returns {{ score: number, confidence: number }} score [0.0, 10.0] e confiança [0, 100]
 */
export function calculateSmartScore(reviews, sentimentDistribution, patterns) {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return { score: 0.0, confidence: 0 };
  }

  const baseRating = calculateBaseRating(reviews);
  const sentimentScore = calculateSentimentScore(sentimentDistribution);
  const recencyScore = calculateRecencyScore(reviews);

  const rawScore =
    baseRating * WEIGHT_BASE_RATING +
    sentimentScore * WEIGHT_SENTIMENT +
    recencyScore * WEIGHT_RECENCY;

  const clamped = Math.max(MIN_SCORE, Math.min(MAX_SCORE, rawScore));
  return applyConfidenceFactor(clamped, reviews.length);
}
