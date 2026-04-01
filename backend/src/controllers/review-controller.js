// Controller de avaliações — handlers para listagem e criação de avaliações
import { getReviewsByProduct, createReviewService } from '../services/review-service.js';

/**
 * Handler de listagem de avaliações de um produto.
 * Lê o `id` do produto dos parâmetros da rota e os filtros da query string.
 * Retorna resultado paginado com avaliações, total, página atual e total de páginas.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getReviews(req, res, next) {
  try {
    const productId = req.params.id;
    const { sentiment, sort, page, pattern, rating } = req.query;
    const result = await getReviewsByProduct(productId, { sentiment, sort, page, pattern, rating });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Handler de criação de avaliação.
 * Lê o `id` do produto dos parâmetros da rota, texto e nota do body,
 * e usa req.user.id como userId.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function createReview(req, res, next) {
  try {
    const productId = req.params.id;
    const { text, rating } = req.body;
    const userId = req.user.id;
    const review = await createReviewService({ productId, userId, text, rating });
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
}
