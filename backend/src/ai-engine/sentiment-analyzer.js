// Analisador de sentimento com Ollama (LLM local) + fallback heurístico
// Tenta usar o Ollama para análise precisa; se indisponível, usa heurística com pesos

import { generate, isOllamaAvailable } from './ollama-client.js';

// ── Fallback heurístico ────────────────────────────────────────────────────

const POSITIVE_WORDS = {
  excelente: 3, perfeito: 3, maravilhoso: 3, incrível: 3, excepcional: 3,
  fantástico: 3, espetacular: 3, sensacional: 3, impecável: 3, extraordinário: 3,
  ótimo: 2, adorei: 2, recomendo: 2, satisfeito: 2, qualidade: 2,
  eficiente: 2, confiável: 2, durável: 2, resistente: 2, funcional: 2,
  prático: 2, elegante: 2, bonito: 2, rápido: 2, preciso: 2,
  'vale a pena': 2, 'muito bom': 2, 'super bom': 2, 'bem feito': 2,
  bom: 1, legal: 1, gostei: 1, ok: 1, razoável: 1,
  agradável: 1, útil: 1, simples: 1, fácil: 1, leve: 1,
  bonita: 1, bacana: 1, interessante: 1, adequado: 1, satisfatório: 1,
  atendeu: 1, cumpre: 1, funciona: 1, chegou: 1, entregou: 1,
};

const NEGATIVE_WORDS = {
  péssimo: 3, horrível: 3, terrível: 3, lixo: 3, inaceitável: 3,
  vergonhoso: 3, absurdo: 3, ridículo: 3, deplorável: 3, catastrófico: 3,
  ruim: 2, defeito: 2, problema: 2, quebrou: 2, decepcionante: 2,
  insatisfeito: 2, frágil: 2, falhou: 2, parou: 2, travou: 2,
  demorou: 2, atrasou: 2, errado: 2, incorreto: 2, danificado: 2,
  'não funciona': 2, 'não recomendo': 2, 'muito ruim': 2, 'mal feito': 2,
  regular: 1, mediano: 1, fraco: 1, demora: 1, lento: 1,
  pesado: 1, difícil: 1, complicado: 1, caro: 1, barulhento: 1,
};

const NEGATION_WORDS = new Set([
  'não', 'nao', 'nunca', 'jamais', 'nem', 'tampouco',
  'nenhum', 'nenhuma', 'sem', 'impossível',
]);

const NEGATION_WINDOW = 3;

function scoreCompoundExpressions(text, wordMap) {
  let score = 0;
  for (const [expr, weight] of Object.entries(wordMap)) {
    if (expr.includes(' ') && text.includes(expr)) score += weight;
  }
  return score;
}

/**
 * Análise heurística de sentimento (fallback quando Ollama indisponível).
 * @param {string} text
 * @returns {'positive' | 'neutral' | 'negative'}
 */
function analyzeSentimentHeuristic(text) {
  if (!text || typeof text !== 'string') return 'neutral';

  const normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const words = normalized.split(/\s+/);

  let positiveScore = 0;
  let negativeScore = 0;

  const normalizedFull = text.toLowerCase();
  positiveScore += scoreCompoundExpressions(normalizedFull, POSITIVE_WORDS);
  negativeScore += scoreCompoundExpressions(normalizedFull, NEGATIVE_WORDS);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let isNegated = false;
    for (let j = Math.max(0, i - NEGATION_WINDOW); j < i; j++) {
      if (NEGATION_WORDS.has(words[j])) { isNegated = true; break; }
    }

    const posWeight = POSITIVE_WORDS[word] || 0;
    const negWeight = NEGATIVE_WORDS[word] || 0;

    if (posWeight > 0) isNegated ? (negativeScore += posWeight) : (positiveScore += posWeight);
    if (negWeight > 0) isNegated ? (positiveScore += negWeight) : (negativeScore += negWeight);
  }

  const diff = positiveScore - negativeScore;
  if (diff > 1) return 'positive';
  if (diff < -1) return 'negative';
  return 'neutral';
}

// ── Análise via Ollama ─────────────────────────────────────────────────────

/**
 * Prompt otimizado para classificação de sentimento em português.
 * Instruções diretas para retornar apenas uma palavra — reduz tokens e latência.
 */
function buildSentimentPrompt(text) {
  return `Você é um classificador de sentimento para avaliações de produtos em português brasileiro.

Analise o sentimento da avaliação abaixo e responda APENAS com uma das três palavras:
- positive (avaliação positiva ou satisfeita)
- negative (avaliação negativa ou insatisfeita)  
- neutral (avaliação neutra ou mista)

Responda SOMENTE com a palavra, sem explicação, sem pontuação.

Avaliação: "${text}"

Sentimento:`;
}

/**
 * Parseia a resposta do modelo para um dos três valores válidos.
 * Tolerante a variações de capitalização e texto extra.
 * @param {string} response
 * @returns {'positive' | 'neutral' | 'negative' | null} null se não reconhecido
 */
function parseSentimentResponse(response) {
  const lower = response.toLowerCase().trim();
  if (lower.includes('positive') || lower.includes('positiv')) return 'positive';
  if (lower.includes('negative') || lower.includes('negativ')) return 'negative';
  if (lower.includes('neutral') || lower.includes('neutro') || lower.includes('neutra')) return 'neutral';
  return null;
}

/** Cache de disponibilidade do Ollama — reavalia a cada 60 segundos */
let ollamaAvailableCache = null;
let ollamaLastCheck = 0;
const OLLAMA_CHECK_INTERVAL_MS = 60 * 1000;

async function checkOllamaAvailable() {
  const now = Date.now();
  if (ollamaAvailableCache !== null && now - ollamaLastCheck < OLLAMA_CHECK_INTERVAL_MS) {
    return ollamaAvailableCache;
  }
  ollamaAvailableCache = await isOllamaAvailable();
  ollamaLastCheck = now;
  return ollamaAvailableCache;
}

/**
 * Analisa o sentimento de um texto em português.
 * Usa Ollama (LLM local) quando disponível; caso contrário, usa heurística com pesos.
 * A interface é idêntica à versão anterior — nenhum outro módulo precisa mudar.
 *
 * @param {string} text — texto da avaliação
 * @returns {Promise<'positive' | 'neutral' | 'negative'>} classificação de sentimento
 */
export async function analyzeSentiment(text) {
  if (!text || typeof text !== 'string') return 'neutral';

  // Tenta usar Ollama se disponível
  const ollamaAvailable = await checkOllamaAvailable();

  if (ollamaAvailable) {
    try {
      const prompt = buildSentimentPrompt(text);
      const response = await generate(prompt, { temperature: 0.1, maxTokens: 10 });
      const sentiment = parseSentimentResponse(response);

      if (sentiment) {
        return sentiment;
      }
      // Resposta não reconhecida — cai para heurística
      console.warn('[Sentiment] Ollama retornou resposta inesperada, usando heurística:', response);
    } catch (error) {
      // Timeout ou erro de rede — invalida cache e cai para heurística
      ollamaAvailableCache = false;
      ollamaLastCheck = Date.now();
      console.warn('[Sentiment] Ollama indisponível, usando heurística:', error.message);
    }
  }

  // Fallback heurístico
  return analyzeSentimentHeuristic(text);
}
