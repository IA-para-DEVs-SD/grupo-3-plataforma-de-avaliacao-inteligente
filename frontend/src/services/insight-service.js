import api from './api.js';

/**
 * Serviço de insights — encapsula chamadas à API de insights de IA
 * para reutilização em diferentes partes do frontend.
 */

/**
 * Busca os insights de IA de um produto.
 * Retorna dados de sentimento, resumo, padrões e score inteligente.
 * @param {string} productId — identificador do produto
 * @returns {Promise<object>} dados de insights do produto
 */
export async function getInsights(productId) {
  const response = await api.get(`/products/${productId}/insights`);
  return response.data.insights;
}
