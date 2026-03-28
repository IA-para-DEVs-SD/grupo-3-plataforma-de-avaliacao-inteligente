// Testes unitários para o middleware centralizado de erros e classe AppError
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { errorMiddleware, AppError } from './error-middleware.js';

/**
 * Cria um mock de resposta Express para capturar status e JSON retornados.
 */
function createMockRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(data) {
      res.body = data;
      return res;
    },
  };
  return res;
}

const noop = () => {};

describe('AppError', () => {
  test('deve criar erro com código, mensagem e status inferido do mapa', () => {
    const err = new AppError('NOT_FOUND', 'Recurso não encontrado');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('AppError');
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('Recurso não encontrado');
    expect(err.statusCode).toBe(404);
    expect(err.details).toEqual([]);
  });

  test('deve aceitar details customizados', () => {
    const details = [{ field: 'email', message: 'Formato inválido' }];
    const err = new AppError('VALIDATION_ERROR', 'Dados inválidos', details);
    expect(err.statusCode).toBe(422);
    expect(err.details).toEqual(details);
  });

  test('deve aceitar statusCode explícito sobrescrevendo o mapa', () => {
    const err = new AppError('CUSTOM_CODE', 'Erro customizado', null, 418);
    expect(err.statusCode).toBe(418);
    expect(err.code).toBe('CUSTOM_CODE');
    expect(err.details).toEqual([]);
  });

  test('deve usar status 500 para código desconhecido sem statusCode explícito', () => {
    const err = new AppError('UNKNOWN_CODE', 'Algo deu errado');
    expect(err.statusCode).toBe(500);
  });

  test.each([
    ['INVALID_CREDENTIALS', 401],
    ['UNAUTHORIZED', 401],
    ['EMAIL_ALREADY_EXISTS', 409],
    ['NOT_FOUND', 404],
    ['VALIDATION_ERROR', 422],
    ['RATE_LIMIT_EXCEEDED', 429],
    ['AI_PROCESSING_FAILED', 500],
    ['INTERNAL_ERROR', 500],
  ])('deve mapear código %s para status %i', (code, expectedStatus) => {
    const err = new AppError(code, 'teste');
    expect(err.statusCode).toBe(expectedStatus);
  });
});

describe('errorMiddleware', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  test('deve retornar formato padrão { error: { code, message, details } }', () => {
    const err = new AppError('NOT_FOUND', 'Produto não encontrado');
    const res = createMockRes();

    errorMiddleware(err, {}, res, noop);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Produto não encontrado',
        details: [],
      },
    });
  });

  test('deve tratar erro genérico (sem code/statusCode) como INTERNAL_ERROR 500', () => {
    const err = new Error('algo quebrou');
    const res = createMockRes();

    errorMiddleware(err, {}, res, noop);

    expect(res.statusCode).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  test('deve incluir details quando fornecidos', () => {
    const details = [{ field: 'rating', message: 'Deve ser entre 1 e 5' }];
    const err = new AppError('VALIDATION_ERROR', 'Validação falhou', details);
    const res = createMockRes();

    errorMiddleware(err, {}, res, noop);

    expect(res.statusCode).toBe(422);
    expect(res.body.error.details).toEqual(details);
  });

  test('deve ocultar mensagem de erro interno genérico em produção', () => {
    process.env.NODE_ENV = 'production';
    const err = new Error('stack trace sensível aqui');
    const res = createMockRes();

    errorMiddleware(err, {}, res, noop);

    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toBe('Erro interno do servidor');
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  test('deve preservar mensagem de AppError com código específico em produção', () => {
    process.env.NODE_ENV = 'production';
    const err = new AppError('NOT_FOUND', 'Produto não encontrado');
    const res = createMockRes();

    errorMiddleware(err, {}, res, noop);

    expect(res.body.error.message).toBe('Produto não encontrado');
  });

  test('deve preservar mensagem de AppError INTERNAL_ERROR customizado em produção', () => {
    process.env.NODE_ENV = 'production';
    // AppError com INTERNAL_ERROR mas mensagem customizada — em produção, mensagem genérica
    const err = new AppError('INTERNAL_ERROR', 'Detalhes internos sensíveis');
    const res = createMockRes();

    errorMiddleware(err, {}, res, noop);

    // Erros INTERNAL_ERROR 500 devem ter mensagem genérica em produção
    expect(res.body.error.message).toBe('Erro interno do servidor');
  });

  test('não deve expor stack trace na resposta JSON', () => {
    const err = new Error('algo deu errado');
    const res = createMockRes();

    errorMiddleware(err, {}, res, noop);

    // Verifica que o objeto de resposta não contém a propriedade stack
    expect(res.body.error).not.toHaveProperty('stack');
    expect(res.body.error).toEqual({
      code: expect.any(String),
      message: expect.any(String),
      details: expect.any(Array),
    });
  });

  test('deve logar erro no console em desenvolvimento', () => {
    process.env.NODE_ENV = 'development';
    const err = new AppError('NOT_FOUND', 'Teste de log');
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = createMockRes();
    errorMiddleware(err, {}, res, noop);

    expect(spy).toHaveBeenCalledWith('[ErrorMiddleware]', err);
    spy.mockRestore();
  });

  test('não deve logar erro no console em produção', () => {
    process.env.NODE_ENV = 'production';
    const err = new AppError('NOT_FOUND', 'Teste sem log');
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = createMockRes();
    errorMiddleware(err, {}, res, noop);

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  test('deve inferir statusCode do code do erro quando err.statusCode não existe', () => {
    const err = { code: 'RATE_LIMIT_EXCEEDED', message: 'Limite excedido' };
    const res = createMockRes();

    errorMiddleware(err, {}, res, noop);

    expect(res.statusCode).toBe(429);
    expect(res.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });
});
