// Serviço de produtos — validação de dados e orquestração do model
import { createProduct, findById, search } from '../models/product-model.js';
import { AppError } from '../middleware/error-middleware.js';

/**
 * Cria um novo produto após validar os campos obrigatórios.
 * Lança VALIDATION_ERROR se nome, descrição ou categoria estiverem vazios.
 * @param {{ name: string, description: string, category: string, imageUrl?: string, createdBy: string }} dados do produto
 * @returns {Promise<object>} Produto criado
 * @throws {AppError} VALIDATION_ERROR se campos obrigatórios estiverem ausentes ou vazios
 */
export async function createProductService({ name, description, category, imageUrl, createdBy }) {
  const errors = [];

  if (!name || name.trim() === '') {
    errors.push({ field: 'name', message: 'Nome é obrigatório' });
  }

  if (!description || description.trim() === '') {
    errors.push({ field: 'description', message: 'Descrição é obrigatória' });
  }

  if (!category || category.trim() === '') {
    errors.push({ field: 'category', message: 'Categoria é obrigatória' });
  }

  if (errors.length > 0) {
    throw new AppError('VALIDATION_ERROR', 'Dados do produto inválidos', errors);
  }

  const product = await createProduct({
    name: name.trim(),
    description: description.trim(),
    category: category.trim(),
    imageUrl: imageUrl || null,
    createdBy,
  });

  return product;
}

/**
 * Busca um produto pelo ID.
 * Lança NOT_FOUND se o produto não existir.
 * @param {string} id - ID do produto
 * @returns {Promise<object>} Produto encontrado
 * @throws {AppError} NOT_FOUND se o produto não existir
 */
export async function getProductById(id) {
  const product = await findById(id);

  if (!product) {
    throw new AppError('NOT_FOUND', 'Produto não encontrado');
  }

  return product;
}

/**
 * Busca produtos por termo (nome ou categoria).
 * Retorna array vazio se nenhum resultado for encontrado.
 * @param {string} [term] - Termo de busca
 * @returns {Promise<Array<object>>} Lista de produtos encontrados
 */
export async function searchProducts(term) {
  const results = await search(term);
  return results;
}
