// Gerador de resumo heurístico (POC)
// Agrupa frases das avaliações por sentimento para gerar pontos positivos e negativos

/** Número máximo de pontos positivos/negativos no resumo */
const MAX_POINTS = 5;

/**
 * Extrai a primeira frase de um texto.
 * Considera ponto final, exclamação ou interrogação como delimitadores.
 * @param {string} text — texto da avaliação
 * @returns {string} primeira frase (ou texto inteiro se não houver delimitador)
 */
function extractFirstSentence(text) {
  if (!text || typeof text !== 'string') return '';

  const trimmed = text.trim();
  const match = trimmed.match(/^[^.!?]+[.!?]?/);
  return match ? match[0].trim() : trimmed;
}

/**
 * Gera um resumo automático a partir de avaliações classificadas por sentimento.
 * Agrupa a primeira frase de cada avaliação por sentimento (positivo/negativo).
 * Limita a 5 pontos positivos e 5 negativos.
 * @param {Array<{ text: string, sentiment: string }>} reviews — avaliações com texto e sentimento
 * @returns {{ positives: string[], negatives: string[] }} resumo com pontos positivos e negativos
 */
export function generateSummary(reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return { positives: [], negatives: [] };
  }

  const positives = [];
  const negatives = [];

  for (const review of reviews) {
    if (!review || !review.text || !review.sentiment) continue;

    const sentence = extractFirstSentence(review.text);
    if (!sentence) continue;

    if (review.sentiment === 'positive' && positives.length < MAX_POINTS) {
      positives.push(sentence);
    } else if (review.sentiment === 'negative' && negatives.length < MAX_POINTS) {
      negatives.push(sentence);
    }
  }

  return { positives, negatives };
}
