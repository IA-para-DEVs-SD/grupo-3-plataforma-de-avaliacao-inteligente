// Analisador de sentimento heurístico baseado em palavras-chave (POC)
// Classifica textos em português como positivo, neutro ou negativo

/** Palavras-chave que indicam sentimento positivo */
const POSITIVE_KEYWORDS = [
  'excelente', 'ótimo', 'bom', 'recomendo', 'adorei',
  'perfeito', 'maravilhoso', 'incrível', 'satisfeito', 'qualidade',
];

/** Palavras-chave que indicam sentimento negativo */
const NEGATIVE_KEYWORDS = [
  'péssimo', 'ruim', 'horrível', 'terrível', 'defeito',
  'problema', 'quebrou', 'decepcionante', 'insatisfeito', 'lixo',
];

/**
 * Analisa o sentimento de um texto em português usando heurística de palavras-chave.
 * Conta ocorrências de palavras positivas e negativas e retorna a classificação.
 * @param {string} text — texto da avaliação
 * @returns {'positive' | 'neutral' | 'negative'} classificação de sentimento
 */
export function analyzeSentiment(text) {
  if (!text || typeof text !== 'string') {
    return 'neutral';
  }

  const normalized = text.toLowerCase();

  let positiveCount = 0;
  let negativeCount = 0;

  for (const keyword of POSITIVE_KEYWORDS) {
    if (normalized.includes(keyword)) {
      positiveCount += 1;
    }
  }

  for (const keyword of NEGATIVE_KEYWORDS) {
    if (normalized.includes(keyword)) {
      negativeCount += 1;
    }
  }

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}
