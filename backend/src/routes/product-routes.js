// Rotas de produtos — busca, detalhes, cadastro e insights
import { Router } from 'express';
import { searchProducts, getProductById, createProduct } from '../controllers/product-controller.js';
import { getInsights } from '../controllers/insight-controller.js';
import { authMiddleware } from '../middleware/auth-middleware.js';
import { validateCreateProduct } from '../middleware/validation-middleware.js';
import { insightRateLimit } from '../middleware/rate-limit-middleware.js';

const router = Router();

// Busca de produtos (público)
router.get('/', searchProducts);

// Detalhes de um produto (público)
router.get('/:id', getProductById);

// Cadastro de novo produto (autenticado, com validação de entrada)
router.post('/', authMiddleware, validateCreateProduct, createProduct);

// Insights de IA de um produto (público, com rate limiting por IP)
router.get('/:id/insights', insightRateLimit, getInsights);

export default router;
