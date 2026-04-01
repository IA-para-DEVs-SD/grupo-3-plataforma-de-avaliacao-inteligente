// Detector de padrões recorrentes aprimorado (v2)
// Extrai unigramas e bigramas significativos agrupados por sentimento

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
  'minha', 'minhas', 'tudo', 'nada', 'algo', 'alguem', 'ninguem',
  'tambem', 'apenas', 'porem', 'contudo', 'porque', 'pois',
  'entao', 'assim', 'logo', 'tanto', 'quanto', 'embora',
  'seria', 'foram', 'sendo', 'tinha', 'tenho', 'temos',
  'pode', 'poderia', 'deve', 'deveria', 'esta', 'estou',
  'estava', 'estao', 'sera', 'fosse', 'produto', 'item',
  'com', 'sem', 'mas', 'que', 'nao', 'sim', 'uma', 'uns',
  'muito', 'pouco', 'mais', 'menos', 'bem', 'mal',
]);

/**
 * Normaliza texto removendo acentos e caracteres especiais.
 * @param {string} text
 * @returns {string}
 */
function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, ' ');
}

/**
 * Extrai palavras significativas de um texto (unigramas).
 * @param {string} text
 * @returns {string[]}
 */
function extractWords(text) {
  return normalize(text)
    .split(/\s+/)
    .filter((w) => w.length >= MIN_WORD_LENGTH && !STOPWORDS.has(w));
}

/**
 * Extrai bigramas (pares de palavras adjacentes) significativos.
 * Ex: "boa qualidade", "entrega rapida", "bateria fraca"
 * @param {string[]} words — lista de palavras já filtradas
 * @returns {string[]} bigramas no formato "palavra1 palavra2"
 */
function extractBigrams(words) {
  const bigrams = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]} ${words[i + 1]}`);
  }
  return bigrams;
}

/**
 * Conta a frequência de cada termo em uma lista.
 * @param {string[]} terms
 * @returns {Map<string, number>}
 */
function countFrequency(terms) {
  const freq = new Map();
  for (const term of terms) {
    freq.set(term, (freq.get(term) || 0) + 1);
  }
  return freq;
}

/**
 * Retorna os N termos mais frequentes, priorizando bigramas sobre unigramas
 * quando a frequência for igual (bigramas são mais informativos).
 * @param {Map<string, number>} freqMap
 * @param {number} limit
 * @returns {string[]}
 */
function topTerms(freqMap, limit) {
  return Array.from(freqMap.entries())
    .filter(([, count]) => count >= 2) // ignora termos que aparecem só 1 vez
    .sort((a, b) => {
      // Prioriza bigramas em caso de empate
      if (b[1] !== a[1]) return b[1] - a[1];
      const aIsBigram = a[0].includes(' ');
      const bIsBigram = b[0].includes(' ');
      if (aIsBigram && !bIsBigram) return -1;
      if (!aIsBigram && bIsBigram) return 1;
      return 0;
    })
    .slice(0, limit)
    .map(([term]) => term);
}

/**
 * Detecta padrões recorrentes nas avaliações usando unigramas e bigramas.
 * Agrupa por sentimento: positivo → strengths, negativo → weaknesses.
 * @param {Array<{ text: string, sentiment: string }>} reviews
 * @returns {{ strengths: string[], weaknesses: string[] }}
 */
export function detectPatterns(reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return { strengths: [], weaknesses: [] };
  }

  const positiveTerms = [];
  const negativeTerms = [];

  for (const review of reviews) {
    if (!review?.text || !review?.sentiment) continue;

    const words = extractWords(review.text);
    const bigrams = extractBigrams(words);
    const allTerms = [...words, ...bigrams];

    if (review.sentiment === 'positive') {
      positiveTerms.push(...allTerms);
    } else if (review.sentiment === 'negative') {
      negativeTerms.push(...allTerms);
    }
  }

  const strengths = topTerms(countFrequency(positiveTerms), MAX_PATTERNS);
  const weaknesses = topTerms(countFrequency(negativeTerms), MAX_PATTERNS);

  return { strengths, weaknesses };
}
