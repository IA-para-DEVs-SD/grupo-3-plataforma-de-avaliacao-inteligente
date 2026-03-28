import api from './api.js';

/**
 * Serviço de avaliações — encapsula chamadas à API de avaliações
 * para reutilização em diferentes partes do frontend.
 */

/**
 * Busca avaliações de um produto com filtros e paginação.
 * @param {string} productId — identificador do produto
 * @param {object} [options] — opções de filtro e paginação
 * @param {string} [options.sentiment] — filtro de sentimento (positive, neutral, negative)
 * @param {string} [options.sort] — ordenação (rating_asc, rating_desc)
 * @param {number} [options.page] — número da página
 * @param {string} [options.pattern] — filtro por padrão recorrente
 * @returns {Promise<object>} dados da resposta com reviews, total, page, totalPages
 */
export async function getReviews(productId, options = {}) {
  const params = {};
  if (options.sentiment) params.sentiment = options.sentiment;
  if (options.sort) params.sort = options.sort;
  if (options.page) params.page = options.page;
  if (options.pattern) params.pattern = options.pattern;

  const response = await api.get(`/products/${productId}/reviews`, { params });
  return response.data;
}

/**
 * Submete uma nova avaliação para um produto.
 * @param {string} productId — identificador do produto
 * @param {{ text: string, rating: number }} reviewData — dados da avaliação
 * @returns {Promise<object>} dados da avaliação criada
 */
export async function createReview(productId, { text, rating }) {
  const response = await api.post(`/products/${productId}/reviews`, { text, rating });
  return response.data;
}
