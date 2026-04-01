// Assistente de escrita de avaliação via Ollama
// Sugere melhorias para avaliações em tempo real

import { generate, isOllamaAvailable } from './ollama-client.js';

/**
 * Analisa uma avaliação em andamento e sugere como melhorá-la.
 * Retorna sugestões específicas para tornar a avaliação mais útil.
 *
 * @param {string} text — texto atual da avaliação
 * @param {number} rating — nota selecionada (1-5)
 * @param {string} productName — nome do produto sendo avaliado
 * @returns {Promise<{ tip: string | null, quality: 'low'|'medium'|'high' }>}
 */
export async function getReviewTip(text, rating, productName) {
  if (!text || text.trim().length < 15) {
    return { tip: 'Descreva sua experiência com o produto para ajudar outros compradores.', quality: 'low' };
  }

  if (!await isOllamaAvailable()) return { tip: null, quality: 'medium' };

  const prompt = `Você é um assistente que ajuda usuários a escrever avaliações mais úteis em português brasileiro.

Produto: ${productName}
Nota: ${rating}/5
Avaliação atual: "${text}"

Analise a avaliação e responda com JSON:
{
  "quality": "low/medium/high",
  "tip": "sugestão curta (máximo 80 chars) ou null se já estiver boa"
}

Critérios de qualidade:
- low: muito genérica, sem detalhes específicos
- medium: tem algum detalhe mas pode melhorar
- high: específica, útil, menciona aspectos concretos

Dicas úteis a sugerir (escolha a mais relevante):
- Mencionar há quanto tempo usa o produto
- Descrever um caso de uso específico
- Comparar com produto anterior
- Mencionar o que mais surpreendeu (positivo ou negativo)

JSON:`;

  try {
    const response = await generate(prompt, { temperature: 0.2, maxTokens: 100 });
    const match = response.match(/\{[\s\S]*\}/);
    if (!match) return { tip: null, quality: 'medium' };
    const parsed = JSON.parse(match[0]);
    return {
      tip: parsed.tip || null,
      quality: ['low', 'medium', 'high'].includes(parsed.quality) ? parsed.quality : 'medium',
    };
  } catch {
    return { tip: null, quality: 'medium' };
  }
}
