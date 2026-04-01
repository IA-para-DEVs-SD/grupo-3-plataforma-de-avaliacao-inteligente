import api from './api.js';

/**
 * Envia mensagem ao chat de recomendação de produtos.
 * @param {string} message
 * @param {Array<{role: string, content: string}>} history
 */
export async function sendChatMessage(message, history = []) {
  const response = await api.post('/chat/recommend', { message, history });
  return response.data;
}

/**
 * Solicita dica de melhoria para avaliação em andamento.
 * @param {string} text
 * @param {number} rating
 * @param {string} productName
 */
export async function getReviewTip(text, rating, productName) {
  const response = await api.post('/chat/review-tip', { text, rating, productName });
  return response.data;
}
