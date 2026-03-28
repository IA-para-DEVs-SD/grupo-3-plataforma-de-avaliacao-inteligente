// Detector de padrões recorrentes heurístico (POC)
// Análise de frequência de termos significativos agrupados por sentimento

/** Número máximo de padrões por categoria */
const MAX_PATTERNS = 5;

/** Comprimento mínimo de palavra para ser considerada significativa */
const MIN_WORD_LENGTH = 4;

/** Stopwords em português — palavras comuns sem valor semântico */
const STOPWORDS = new Set([
  'para', 'como', 'mais', 'muito', 'este', 'esta', 'esse', 'essa',
  'isso', 'aqui', 'onde', 'quando', 'qual', 'quais', 'cada', 'todo',
  'toda', 'todos', 'todas', 'outro', 'outra', 'outros', 'outras',
  'mesmo', 'mesma', 'ainda', 'depois', 'antes', 'sobre', 'entre',
  'desde', 'pela', 'pelo', 'pelas', 'pelos', 'numa', 'numas',
  'dele', 'dela', 'deles', 'delas', 'nele', 'nela', 'neles', 'nelas',
  'aquele', 'aquela', 'aqueles', 'aquelas', 'algum', 'alguma',
  'alguns', 'algumas', 'nenhum', 'nenhuma', 'nenhuns', 'nenhumas',
  'minha', 'minhas', 'tudo', 'nada', 'algo', 'alguém', 'ninguém',
  'também', 'apenas', 'porém', 'contudo', 'porque', 'pois',
  'então', 'assim', 'logo', 'tanto', 'quanto', 'embora',
  'seria', 'foram', 'sendo', 'tinha', 'tenho', 'temos',
  'pode', 'poderia', 'deve', 'deveria', 'está', 'estou',
  'estava', 'estão', 'foram', 'será', 'seria', 'fosse',
  'com', 'sem', 'mas', 'que', 'não', 'sim', 'uma', 'uns',
]);

/**
 * Extrai palavras significativas de um texto.
 * Filtra por comprimento mínimo e remove stopwords.
 * @param {string} text — texto da avaliação
 * @returns {string[]} palavras significativas em minúsculo
 */
function extractSignificantWords(text) {
  if (!text || typeof text !== 'string') return [];

  return text
    .toLowerCase()
    .replace(/[^a-záàâãéèêíïóôõöúçñ\s]/gi, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= MIN_WORD_LENGTH && !STOPWORDS.has(word));
}

/**
 * Conta a frequência de cada palavra em uma lista.
 * @param {string[]} words — lista de palavras
 * @returns {Map<string, number>} mapa de palavra → frequência
 */
function countFrequency(words) {
  const freq = new Map();
  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1);
  }
  return freq;
}

/**
 * Retorna os N termos mais frequentes de um mapa de frequência.
 * @param {Map<string, number>} freqMap — mapa de frequência
 * @param {number} limit — número máximo de termos
 * @returns {string[]} termos mais frequentes
 */
function topTerms(freqMap, limit) {
  return Array.from(freqMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term]) => term);
}

/**
 * Detecta padrões recorrentes nas avaliações usando análise de frequência de termos.
 * Agrupa palavras significativas por sentimento (positivo → strengths, negativo → weaknesses).
 * Retorna os 5 termos mais frequentes de cada categoria.
 * @param {Array<{ text: string, sentiment: string }>} reviews — avaliações com texto e sentimento
 * @returns {{ strengths: string[], weaknesses: string[] }} padrões detectados
 */
export function detectPatterns(reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return { strengths: [], weaknesses: [] };
  }

  const positiveWords = [];
  const negativeWords = [];

  for (const review of reviews) {
    if (!review || !review.text || !review.sentiment) continue;

    const words = extractSignificantWords(review.text);

    if (review.sentiment === 'positive') {
      positiveWords.push(...words);
    } else if (review.sentiment === 'negative') {
      negativeWords.push(...words);
    }
  }

  const strengths = topTerms(countFrequency(positiveWords), MAX_PATTERNS);
  const weaknesses = topTerms(countFrequency(negativeWords), MAX_PATTERNS);

  return { strengths, weaknesses };
}
