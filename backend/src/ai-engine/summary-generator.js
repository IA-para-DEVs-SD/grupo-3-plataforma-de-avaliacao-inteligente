// Gerador de resumo com Ollama (LLM local) + fallback heurístico (v3)
// Usa LLM para síntese real quando disponível; caso contrário, seleciona frases diversas

import { generate, isOllamaAvailable } from './ollama-client.js';

const MAX_POINTS = 5;
const MIN_SENTENCE_LENGTH = 15;
const MAX_SENTENCE_LENGTH = 120;

// ── Fallback heurístico ────────────────────────────────────────────────────

function extractSentences(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= MIN_SENTENCE_LENGTH)
    .map((s) => s.length > MAX_SENTENCE_LENGTH ? s.slice(0, MAX_SENTENCE_LENGTH) + '...' : s);
}

function similarity(a, b) {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let intersection = 0;
  for (const w of wordsA) { if (wordsB.has(w)) intersection++; }
  return intersection / (wordsA.size + wordsB.size - intersection);
}

function selectDiverseSentences(sentences, limit) {
  const selected = [];
  for (const sentence of sentences) {
    if (selected.length >= limit) break;
    if (!selected.some((s) => similarity(s, sentence) > 0.5)) selected.push(sentence);
  }
  return selected;
}

function generateSummaryHeuristic(reviews) {
  const positiveSentences = [];
  const negativeSentences = [];
  for (const review of reviews) {
    if (!review?.text || !review?.sentiment) continue;
    const sentences = extractSentences(review.text);
    if (review.sentiment === 'positive') positiveSentences.push(...sentences);
    else if (review.sentiment === 'negative') negativeSentences.push(...sentences);
  }
  return {
    positives: selectDiverseSentences(positiveSentences, MAX_POINTS),
    negatives: selectDiverseSentences(negativeSentences, MAX_POINTS),
  };
}

// ── Geração via Ollama ─────────────────────────────────────────────────────

/**
 * Monta o prompt para geração de resumo via LLM.
 * Instrui o modelo a retornar JSON estruturado com pontos positivos e negativos.
 */
function buildSummaryPrompt(reviews) {
  const positiveTexts = reviews
    .filter((r) => r.sentiment === 'positive')
    .map((r) => `- ${r.text}`)
    .join('\n');

  const negativeTexts = reviews
    .filter((r) => r.sentiment === 'negative')
    .map((r) => `- ${r.text}`)
    .join('\n');

  return `Você é um assistente que resume avaliações de produtos em português brasileiro.

Analise as avaliações abaixo e gere um resumo estruturado com os principais pontos positivos e negativos mencionados pelos clientes.

AVALIAÇÕES POSITIVAS:
${positiveTexts || '(nenhuma)'}

AVALIAÇÕES NEGATIVAS:
${negativeTexts || '(nenhuma)'}

Responda APENAS com um JSON válido no seguinte formato (sem markdown, sem explicação):
{"positives":["ponto 1","ponto 2","ponto 3"],"negatives":["ponto 1","ponto 2"]}

Regras:
- Máximo de ${MAX_POINTS} pontos por categoria
- Cada ponto deve ser uma frase curta e objetiva (máximo 100 caracteres)
- Use linguagem natural em português brasileiro
- Sintetize os temas recorrentes, não copie frases literais
- Se não houver avaliações de uma categoria, use array vazio []

JSON:`;
}

/**
 * Parseia a resposta JSON do modelo com tolerância a erros.
 * @param {string} response
 * @returns {{ positives: string[], negatives: string[] } | null}
 */
function parseSummaryResponse(response) {
  try {
    // Extrai o JSON da resposta (pode ter texto antes/depois)
    const match = response.match(/\{[\s\S]*\}/);
    if (!match) return null;

    const parsed = JSON.parse(match[0]);
    const positives = Array.isArray(parsed.positives)
      ? parsed.positives.filter((s) => typeof s === 'string' && s.trim().length > 0).slice(0, MAX_POINTS)
      : [];
    const negatives = Array.isArray(parsed.negatives)
      ? parsed.negatives.filter((s) => typeof s === 'string' && s.trim().length > 0).slice(0, MAX_POINTS)
      : [];

    return { positives, negatives };
  } catch {
    return null;
  }
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
 * Gera um resumo automático a partir de avaliações classificadas por sentimento.
 * Usa Ollama (LLM local) quando disponível para síntese real em linguagem natural.
 * Fallback para seleção heurística de frases diversas quando Ollama indisponível.
 *
 * @param {Array<{ text: string, sentiment: string }>} reviews
 * @returns {Promise<{ positives: string[], negatives: string[] }>}
 */
export async function generateSummary(reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return { positives: [], negatives: [] };
  }

  const classified = reviews.filter((r) => r?.text && r?.sentiment);
  if (classified.length === 0) return { positives: [], negatives: [] };

  // Tenta usar Ollama se disponível
  const ollamaAvailable = await checkOllamaAvailable();

  if (ollamaAvailable) {
    try {
      const prompt = buildSummaryPrompt(classified);
      const response = await generate(prompt, { temperature: 0.3, maxTokens: 400 });
      const summary = parseSummaryResponse(response);

      if (summary && (summary.positives.length > 0 || summary.negatives.length > 0)) {
        return summary;
      }
      console.warn('[Summary] Ollama retornou resposta inválida, usando heurística');
    } catch (error) {
      ollamaAvailableCache = false;
      ollamaLastCheck = Date.now();
      console.warn('[Summary] Ollama indisponível, usando heurística:', error.message);
    }
  }

  // Fallback heurístico
  return generateSummaryHeuristic(classified);
}
