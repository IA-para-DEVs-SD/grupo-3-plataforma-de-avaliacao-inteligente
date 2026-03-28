import api from './api.js';

/**
 * Serviço de produtos — encapsula chamadas à API de produtos
 * para reutilização em diferentes partes do frontend.
 */

/**
 * Busca produtos pelo termo informado (nome ou categoria).
 * @param {string} query — termo de busca
 * @returns {Promise<object[]>} lista de produtos encontrados
 */
export async function searchProducts(query) {
  const response = await api.get('/products', { params: { q: query } });
  return response.data.products;
}

/**
 * Retorna os detalhes de um produto pelo ID.
 * @param {string} id — identificador do produto
 * @returns {Promise<object>} dados completos do produto
 */
export async function getProduct(id) {
  const response = await api.get(`/products/${id}`);
  return response.data;
}

/**
 * Cadastra um novo produto na plataforma.
 * @param {{ name: string, description: string, category: string, imageUrl: string }} dados do produto
 * @returns {Promise<object>} dados do produto criado
 */
export async function createProduct({ name, description, category, imageUrl }) {
  const response = await api.post('/products', { name, description, category, imageUrl });
  return response.data;
}
