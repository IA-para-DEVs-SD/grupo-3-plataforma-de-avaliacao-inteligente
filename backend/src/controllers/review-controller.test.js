// Testes unitários para o controller de avaliações
import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock do review-service — deve ser declarado ANTES de importar o controller
jest.unstable_mockModule('../services/review-service.js', () => ({
  getReviewsByProduct: jest.fn(),
  createReviewService: jest.fn(),
}));

// Importa o controller e o serviço mockado após declarar o mock
const { getReviews, createReview } = await import('./review-controller.js');
const { getReviewsByProduct, createReviewService } = await import('../services/review-service.js');

/**
 * Cria um mock de requisição Express com body, query, params e user.
 */
function createMockReq({ body = {}, query = {}, params = {}, user = null } = {}) {
  return { body, query, params, user };
}

/**
 * Cria um mock de resposta Express para capturar status e JSON.
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

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getReviews', () => {
  test('deve retornar 200 com resultado paginado de avaliações', async () => {
    const mockResult = {
      reviews: [
        { id: 'r1', productId: 'p1', text: 'Ótimo produto, recomendo muito!', rating: 5 },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
    };
    getReviewsByProduct.mockResolvedValue(mockResult);

    const req = createMockReq({ params: { id: 'p1' }, query: {} });
    const res = createMockRes();
    const next = jest.fn();

    await getReviews(req, res, next);

    expect(getReviewsByProduct).toHaveBeenCalledWith('p1', {
      sentiment: undefined,
      sort: undefined,
      page: undefined,
      pattern: undefined,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockResult);
    expect(next).not.toHaveBeenCalled();
  });

  test('deve passar filtros de query para o serviço', async () => {
    getReviewsByProduct.mockResolvedValue({ reviews: [], total: 0, page: 1, totalPages: 0 });

    const req = createMockReq({
      params: { id: 'p1' },
      query: { sentiment: 'positive', sort: 'rating_desc', page: '2', pattern: 'bateria' },
    });
    const res = createMockRes();
    const next = jest.fn();

    await getReviews(req, res, next);

    expect(getReviewsByProduct).toHaveBeenCalledWith('p1', {
      sentiment: 'positive',
      sort: 'rating_desc',
      page: '2',
      pattern: 'bateria',
    });
    expect(res.statusCode).toBe(200);
  });

  test('deve chamar next com erro quando getReviewsByProduct lança exceção', async () => {
    const error = new Error('Falha no banco');
    getReviewsByProduct.mockRejectedValue(error);

    const req = createMockReq({ params: { id: 'p1' }, query: {} });
    const res = createMockRes();
    const next = jest.fn();

    await getReviews(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.statusCode).toBeNull();
  });
});

describe('createReview', () => {
  test('deve retornar 201 com avaliação criada ao submeter dados válidos', async () => {
    const mockReview = {
      id: 'r1',
      productId: 'p1',
      userId: 'user-1',
      text: 'Produto excelente, superou expectativas!',
      rating: 5,
    };
    createReviewService.mockResolvedValue(mockReview);

    const req = createMockReq({
      params: { id: 'p1' },
      body: { text: 'Produto excelente, superou expectativas!', rating: 5 },
      user: { id: 'user-1' },
    });
    const res = createMockRes();
    const next = jest.fn();

    await createReview(req, res, next);

    expect(createReviewService).toHaveBeenCalledWith({
      productId: 'p1',
      userId: 'user-1',
      text: 'Produto excelente, superou expectativas!',
      rating: 5,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(mockReview);
    expect(next).not.toHaveBeenCalled();
  });

  test('deve usar req.user.id como userId', async () => {
    createReviewService.mockResolvedValue({ id: 'r1' });

    const req = createMockReq({
      params: { id: 'p1' },
      body: { text: 'Texto válido com mais de vinte caracteres', rating: 4 },
      user: { id: 'user-42' },
    });
    const res = createMockRes();
    const next = jest.fn();

    await createReview(req, res, next);

    expect(createReviewService).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-42' })
    );
  });

  test('deve chamar next com erro quando createReviewService lança exceção de validação', async () => {
    const error = new Error('Dados da avaliação inválidos');
    error.code = 'VALIDATION_ERROR';
    createReviewService.mockRejectedValue(error);

    const req = createMockReq({
      params: { id: 'p1' },
      body: { text: 'curto', rating: 0 },
      user: { id: 'user-1' },
    });
    const res = createMockRes();
    const next = jest.fn();

    await createReview(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.statusCode).toBeNull();
  });

  test('deve usar productId dos params da rota', async () => {
    createReviewService.mockResolvedValue({ id: 'r1' });

    const req = createMockReq({
      params: { id: 'product-abc' },
      body: { text: 'Avaliação com texto suficiente para validar', rating: 3 },
      user: { id: 'user-1' },
    });
    const res = createMockRes();
    const next = jest.fn();

    await createReview(req, res, next);

    expect(createReviewService).toHaveBeenCalledWith(
      expect.objectContaining({ productId: 'product-abc' })
    );
  });
});
