// Middleware centralizado de erros e classe AppError para erros estruturados
// Formato padrão: { error: { code, message, details } }

/**
 * Mapeamento de códigos de erro para status HTTP.
 * Baseado na tabela de erros do design doc.
 */
const ERROR_STATUS_MAP = {
  INVALID_CREDENTIALS: 401,
  UNAUTHORIZED: 401,
  EMAIL_ALREADY_EXISTS: 409,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  RATE_LIMIT_EXCEEDED: 429,
  AI_PROCESSING_FAILED: 500,
  INTERNAL_ERROR: 500,
};

/**
 * Classe de erro customizada para lançar erros estruturados na aplicação.
 * Estende Error nativo com statusCode, code e details.
 */
export class AppError extends Error {
  /**
   * @param {string} code - Código de erro (ex: 'VALIDATION_ERROR')
   * @param {string} message - Mensagem descritiva do erro
   * @param {Array|object|null} details - Detalhes adicionais (campos inválidos, etc.)
   * @param {number|null} statusCode - Status HTTP (inferido do code se não fornecido)
   */
  constructor(code, message, details = null, statusCode = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode || ERROR_STATUS_MAP[code] || 500;
    this.details = details || [];
  }
}

/**
 * Middleware centralizado de erros do Express.
 * Intercepta todas as exceções e retorna respostas padronizadas.
 * Stack traces nunca são expostos em produção.
 *
 * @param {Error} err - Erro capturado
 * @param {import('express').Request} _req - Requisição (não utilizada)
 * @param {import('express').Response} res - Resposta
 * @param {import('express').NextFunction} _next - Próximo middleware (não utilizado)
 */
// eslint-disable-next-line no-unused-vars
export function errorMiddleware(err, _req, res, _next) {
  const isProduction = process.env.NODE_ENV === 'production';

  // Loga o erro no console em ambiente de desenvolvimento
  if (!isProduction) {
    console.error('[ErrorMiddleware]', err);
  }

  // Determina os campos da resposta de erro
  const statusCode = err.statusCode || ERROR_STATUS_MAP[err.code] || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = isProduction && statusCode === 500 && code === 'INTERNAL_ERROR'
    ? 'Erro interno do servidor'
    : err.message || 'Erro interno do servidor';
  const details = err.details || [];

  res.status(statusCode).json({
    error: {
      code,
      message,
      details,
    },
  });
}
