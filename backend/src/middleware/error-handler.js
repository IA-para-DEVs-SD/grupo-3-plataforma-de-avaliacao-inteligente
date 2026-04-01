/**
 * Middleware de rota não encontrada (404).
 * Deve ser registrado após todas as rotas.
 */
const notFoundHandler = (req, res, _next) => {
  res.status(404).json({
    error: {
      status: 404,
      message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
    },
  });
};

/**
 * Middleware centralizado de tratamento de erros.
 * Padroniza respostas de erro e oculta stack traces em produção.
 */
const errorHandler = (err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  const response = {
    error: {
      status,
      message:
        status === 500 && isProduction
          ? 'Erro interno do servidor'
          : err.message || 'Erro interno do servidor',
    },
  };

  // Inclui stack trace apenas em desenvolvimento
  if (!isProduction) {
    response.error.stack = err.stack;
  }

  if (status >= 500) {
    console.error(`[ERRO ${status}]`, err);
  }

  res.status(status).json(response);
};

export { notFoundHandler, errorHandler };
