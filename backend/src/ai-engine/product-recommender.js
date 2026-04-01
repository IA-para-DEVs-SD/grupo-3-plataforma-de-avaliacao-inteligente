// Chat de recomendação de produtos via Ollama
// Conversa com o usuário para entender suas necessidades e recomendar produtos do catálogo

import { generate, isOllamaAvailable } from './ollama-client.js';

/**
 * Processa uma mensagem do usuário no chat de recomendação.
 * Analisa a intenção e retorna uma resposta + produtos recomendados do catálogo.
 *
 * @param {string} userMessage — mensagem do usuário
 * @param {Array<{ id: string, name: string, category: string, description: string }>} products — catálogo disponível
 * @param {Array<{ role: 'user'|'assistant', content: string }>} history — histórico da conversa
 * @returns {Promise<{ reply: string, recommendedProductIds: string[], shouldRedirect: boolean }>}
 */
export async function chatRecommend(userMessage, products, history = []) {
  if (!await isOllamaAvailable()) {
    return {
      reply: 'Desculpe, o assistente de recomendação está temporariamente indisponível. Use a busca para encontrar produtos.',
      recommendedProductIds: [],
      shouldRedirect: false,
    };
  }

  // Monta o catálogo resumido para o contexto do LLM
  const catalog = products.map(p =>
    `ID: ${p.id} | Nome: ${p.name} | Categoria: ${p.category} | Descrição: ${p.description.slice(0, 100)}`
  ).join('\n');

  // Monta o histórico da conversa
  const historyText = history.slice(-6).map(m =>
    `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`
  ).join('\n');

  const prompt = `Você é um assistente de recomendação de produtos da plataforma InsightReview.
Seu objetivo é entender o que o usuário precisa e recomendar produtos do catálogo abaixo.

CATÁLOGO DE PRODUTOS DISPONÍVEIS:
${catalog}

HISTÓRICO DA CONVERSA:
${historyText}

MENSAGEM ATUAL DO USUÁRIO: "${userMessage}"

Responda em português brasileiro de forma amigável e concisa.
Se conseguir identificar produtos relevantes, mencione-os pelo nome.
Se precisar de mais informações, faça UMA pergunta específica.

Responda APENAS com um JSON no formato:
{
  "reply": "sua resposta ao usuário",
  "recommendedProductIds": ["id1", "id2"],
  "shouldRedirect": true/false,
  "redirectMessage": "mensagem antes de redirecionar (se shouldRedirect for true)"
}

Regras:
- shouldRedirect = true apenas quando tiver 1-2 produtos claramente adequados E o usuário demonstrou interesse
- recommendedProductIds deve conter apenas IDs do catálogo acima
- Se não houver produtos adequados, recommendedProductIds = []
- Seja conversacional, não liste todos os produtos de uma vez

JSON:`;

  try {
    const response = await generate(prompt, { temperature: 0.4, maxTokens: 300 });
    const match = response.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Resposta inválida');

    const parsed = JSON.parse(match[0]);
    return {
      reply: parsed.reply || 'Pode me contar mais sobre o que você está procurando?',
      recommendedProductIds: Array.isArray(parsed.recommendedProductIds) ? parsed.recommendedProductIds : [],
      shouldRedirect: !!parsed.shouldRedirect,
      redirectMessage: parsed.redirectMessage || null,
    };
  } catch {
    return {
      reply: 'Pode me contar mais sobre o que você está procurando? Tipo de produto, uso principal, orçamento...',
      recommendedProductIds: [],
      shouldRedirect: false,
    };
  }
}
