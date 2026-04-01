// Detector de avaliações suspeitas via Ollama
// Identifica spam, avaliações geradas por IA ou textos genéricos sem valor

import { generate, isOllamaAvailable } from './ollama-client.js';

/**
 * Analisa se uma avaliação é suspeita (spam, IA, genérica demais).
 * Retorna { suspicious: boolean, reason: string | null }
 *
 * @param {string} text — texto da avaliação
 * @param {number} rating — nota dada (1-5)
 * @returns {Promise<{ suspicious: boolean, reason: string | null }>}
 */
export async function detectSpam(text, rating) {
  if (!text || typeof text !== 'string') return { suspicious: false, reason: null };

  // Verificações heurísticas rápidas (sem LLM)
  if (text.trim().length < 20) return { suspicious: true, reason: 'Texto muito curto' };

  // Detecta texto repetitivo (ex: "bom bom bom bom")
  const words = text.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  if (words.length > 5 && uniqueWords.size / words.length < 0.3) {
    return { suspicious: true, reason: 'Texto com palavras excessivamente repetidas' };
  }

  // Detecta contradição extrema (nota 5 + texto muito negativo ou nota 1 + texto muito positivo)
  const veryPositive = /excelente|perfeito|maravilhoso|incrível|adorei/i.test(text);
  const veryNegative = /péssimo|horrível|terrível|lixo|odeio/i.test(text);
  if (rating === 1 && veryPositive && !veryNegative) {
    return { suspicious: true, reason: 'Contradição entre nota 1 e texto muito positivo' };
  }
  if (rating === 5 && veryNegative && !veryPositive) {
    return { suspicious: true, reason: 'Contradição entre nota 5 e texto muito negativo' };
  }

  // Análise via LLM para casos mais sutis
  if (!await isOllamaAvailable()) return { suspicious: false, reason: null };

  const prompt = `Você é um detector de avaliações falsas ou de baixa qualidade em português brasileiro.

Analise esta avaliação de produto:
Nota: ${rating}/5
Texto: "${text}"

Responda APENAS com um JSON no formato: {"suspicious": true/false, "reason": "motivo ou null"}

Considere suspeito se:
- Texto genérico sem detalhes específicos do produto
- Parece gerado por IA (muito formal, sem personalidade)
- Contradição clara entre nota e texto
- Spam ou propaganda

JSON:`;

  try {
    const response = await generate(prompt, { temperature: 0.1, maxTokens: 80 });
    const match = response.match(/\{[\s\S]*\}/);
    if (!match) return { suspicious: false, reason: null };
    const parsed = JSON.parse(match[0]);
    return {
      suspicious: !!parsed.suspicious,
      reason: parsed.reason || null,
    };
  } catch {
    return { suspicious: false, reason: null };
  }
}
