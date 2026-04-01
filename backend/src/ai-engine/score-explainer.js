// Explicabilidade do Score Inteligente via Ollama
// Gera uma frase em linguagem natural explicando por que o produto tem aquele score

import { generate, isOllamaAvailable } from './ollama-client.js';

/**
 * Gera uma explicação em linguagem natural para o Score Inteligente.
 * Ex: "Score 7.2 — elogiado pela durabilidade, mas com queda recente por reclamações de entrega."
 *
 * @param {number} score — score inteligente (0-10)
 * @param {number} confidence — percentual de confiança (0-100)
 * @param {{ positive: number, neutral: number, negative: number }} sentimentDistribution
 * @param {{ strengths: string[], weaknesses: string[] } | null} patterns
 * @param {number} reviewCount — total de avaliações
 * @returns {Promise<string | null>} frase explicativa ou null se Ollama indisponível
 */
export async function explainScore(score, confidence, sentimentDistribution, patterns, reviewCount) {
  if (!await isOllamaAvailable()) return null;

  const strengths = patterns?.strengths?.slice(0, 3).join(', ') || 'não identificados';
  const weaknesses = patterns?.weaknesses?.slice(0, 3).join(', ') || 'não identificados';
  const { positive = 0, negative = 0 } = sentimentDistribution || {};

  const prompt = `Você é um assistente que explica scores de produtos em português brasileiro de forma concisa.

Dados do produto:
- Score Inteligente: ${score}/10
- Confiança: ${confidence}% (baseado em ${reviewCount} avaliações)
- Avaliações positivas: ${positive}%
- Avaliações negativas: ${negative}%
- Pontos fortes recorrentes: ${strengths}
- Pontos fracos recorrentes: ${weaknesses}

Gere UMA frase curta (máximo 120 caracteres) explicando o score em português brasileiro.
A frase deve começar com "Score ${score} —" e mencionar os principais fatores.
Responda APENAS com a frase, sem aspas, sem explicação adicional.

Frase:`;

  try {
    const response = await generate(prompt, { temperature: 0.3, maxTokens: 60 });
    const cleaned = response.trim().replace(/^["']|["']$/g, '');
    return cleaned.length > 10 ? cleaned : null;
  } catch {
    return null;
  }
}
