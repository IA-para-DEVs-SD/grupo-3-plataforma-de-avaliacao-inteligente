// Controller de produtos — handlers para busca, detalhes e criação de produtos
import { searchProducts as searchProductsService, getProductById as getProductByIdService, createProductService } from '../services/product-service.js';

/**
 * Handler de busca de produtos.
 * Lê o parâmetro `q` da query string e retorna a lista de produtos correspondentes.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function searchProducts(req, res, next) {
  try {
    const { q } = req.query;
    const products = await searchProductsService(q);
    res.status(200).json({ products });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler de detalhes de um produto.
 * Lê o `id` dos parâmetros da rota e retorna o produto encontrado.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const product = await getProductByIdService(id);
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
}

/**
 * Handler de criação de produto.
 * Lê nome, descrição, categoria e imageUrl do body, usa req.user.id como createdBy.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function createProduct(req, res, next) {
  try {
    const { name, description, category, imageUrl } = req.body;
    const createdBy = req.user.id;
    const product = await createProductService({ name, description, category, imageUrl, createdBy });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}
