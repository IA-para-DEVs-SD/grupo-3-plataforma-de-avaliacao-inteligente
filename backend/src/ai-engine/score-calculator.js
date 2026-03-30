// Calculador de score inteligente ponderado (POC)
// Combina nota base (50%), sentimento (30%) e recência (20%)

/** Pesos para cada componente do score */
const WEIGHT_BASE_RATING = 0.5;
const WEIGHT_SENTIMENT = 0.3;
const WEIGHT_RECENCY = 0.2;

/** Escala máxima do score */
const MAX_SCORE = 10.0;

/** Escala mínima do score */
const MIN_SCORE = 0.0;

/**
 * Calcula o componente de nota base: média das notas escalada para 0-10.
 * @param {Array<{ rating: number }>} reviews — avaliações com nota
 * @returns {number} score de nota base (0-10)
 */
function calculateBaseRating(reviews) {
  if (reviews.length === 0) return 0;

  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  const avg = sum / reviews.length;

  // Escala de 1-5 para 0-10
  return ((avg - 1) / 4) * MAX_SCORE;
}

/**
 * Calcula o componente de sentimento: diferença entre positivos e negativos, escalada para 0-10.
 * @param {{ positive: number, negative: number }} distribution — distribuição percentual de sentimento
 * @returns {number} score de sentimento (0-10)
 */
function calculateSentimentScore(distribution) {
  if (!distribution) return 5.0; // neutro como padrão

  const diff = (distribution.positive - distribution.negative) / 100;
  // diff varia de -1 a 1, escalar para 0-10
  return ((diff + 1) / 2) * MAX_SCORE;
}

/**
 * Calcula o componente de recência: média ponderada dando mais peso a avaliações recentes.
 * Avaliações mais recentes recebem peso maior (decaimento linear).
 * @param {Array<{ rating: number, createdAt: string }>} reviews — avaliações ordenadas
 * @returns {number} score de recência (0-10)
 */
function calculateRecencyScore(reviews) {
  if (reviews.length === 0) return 0;

  // Ordena por data (mais recente primeiro)
  const sorted = [...reviews].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  let weightedSum = 0;
  let totalWeight = 0;

  for (let i = 0; i < sorted.length; i++) {
    // Peso decrescente: mais recente = maior peso
    const weight = sorted.length - i;
    weightedSum += (sorted[i].rating || 0) * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;

  const weightedAvg = weightedSum / totalWeight;
  // Escala de 1-5 para 0-10
  return ((weightedAvg - 1) / 4) * MAX_SCORE;
}

/**
 * Calcula o score inteligente ponderado de um produto.
 * Combina: nota base (50%) + sentimento (30%) + recência (20%).
 * Resultado clamped a [0.0, 10.0] e arredondado a 1 casa decimal.
 * @param {Array<{ rating: number, createdAt: string }>} reviews — avaliações do produto
 * @param {{ positive: number, neutral: number, negative: number } | null} sentimentDistribution — distribuição de sentimento
 * @param {{ strengths: string[], weaknesses: string[] } | null} patterns — padrões detectados (reservado para uso futuro)
 * @returns {number} score inteligente [0.0, 10.0]
 */
export function calculateSmartScore(reviews, sentimentDistribution, _patterns) {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return 0.0;
  }

  const baseRating = calculateBaseRating(reviews);
  const sentimentScore = calculateSentimentScore(sentimentDistribution);
  const recencyScore = calculateRecencyScore(reviews);

  const rawScore =
    baseRating * WEIGHT_BASE_RATING +
    sentimentScore * WEIGHT_SENTIMENT +
    recencyScore * WEIGHT_RECENCY;

  // Clamp ao intervalo [0.0, 10.0] e arredonda a 1 casa decimal
  const clamped = Math.max(MIN_SCORE, Math.min(MAX_SCORE, rawScore));
  return Math.round(clamped * 10) / 10;
}
