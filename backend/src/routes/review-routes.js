// Rotas de avaliações — listagem e submissão de avaliações de produtos
import { Router } from 'express';
import { getReviews, createReview } from '../controllers/review-controller.js';
import { authMiddleware } from '../middleware/auth-middleware.js';
import { reviewRateLimit } from '../middleware/rate-limit-middleware.js';

// mergeParams: true permite acessar :id da rota pai (/api/products/:id)
const router = Router({ mergeParams: true });

// Listagem de avaliações de um produto (público)
router.get('/', getReviews);

// Submissão de nova avaliação (autenticado, com rate limiting)
router.post('/', authMiddleware, reviewRateLimit, createReview);

export default router;
