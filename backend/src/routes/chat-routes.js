// Rotas do chat de recomendação e assistente de avaliação
import { Router } from 'express';
import { chatRecommend } from '../ai-engine/product-recommender.js';
import { getReviewTip } from '../ai-engine/review-assistant.js';
import { search } from '../models/product-model.js';
import { insightRateLimit } from '../middleware/rate-limit-middleware.js';

const router = Router();

/**
 * POST /api/chat/recommend
 * Chat de recomendação de produtos.
 * Body: { message: string, history: Array<{role, content}> }
 */
router.post('/recommend', insightRateLimit, async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: { message: 'Mensagem é obrigatória' } });
    }

    // Busca todos os produtos do catálogo
    const products = await search('');

    const result = await chatRecommend(message.trim(), products, history);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/chat/review-tip
 * Sugestão de melhoria para avaliação em andamento.
 * Body: { text: string, rating: number, productName: string }
 */
router.post('/review-tip', async (req, res, next) => {
  try {
    const { text, rating, productName = 'produto' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: { message: 'Texto é obrigatório' } });
    }

    const result = await getReviewTip(text, rating, productName);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
