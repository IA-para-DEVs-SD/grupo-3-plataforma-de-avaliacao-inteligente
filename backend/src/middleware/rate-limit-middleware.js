// Middleware de rate limiting — proteção contra abuso de requisições
import rateLimit from 'express-rate-limit';

/**
 * Rate limit para submissão de avaliações.
 * 10 requisições por minuto por usuário autenticado.
 * Usa req.user.id como chave (rota requer autenticação prévia).
 */
export const reviewRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10,
  keyGenerator: (req) => req.user?.id || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Limite de requisições excedido. Tente novamente em alguns instantes.',
        details: [],
      },
    });
  },
});

/**
 * Rate limit para endpoints de insights de IA.
 * 30 requisições por minuto por endereço IP.
 */
export const insightRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30,
  keyGenerator: (req) => req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Limite de requisições excedido. Tente novamente em alguns instantes.',
        details: [],
      },
    });
  },
});
