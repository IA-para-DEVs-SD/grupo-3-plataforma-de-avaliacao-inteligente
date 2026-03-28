// Controller de insights — handler para consulta de insights de IA de um produto
import { getInsights as getInsightsService } from '../services/insight-service.js';

/**
 * Handler para buscar insights de um produto.
 * Retorna o ProductInsight ou objeto vazio se ainda não houver insights.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getInsights(req, res, next) {
  try {
    const { id } = req.params;
    const insights = await getInsightsService(id);
    res.status(200).json({ insights: insights || null });
  } catch (error) {
    next(error);
  }
}
