// Testes de integração para as rotas de avaliações
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';

// Mock do review-service para isolar os testes de rota
jest.unstable_mockModule('../services/review-service.js', () => ({
  getReviewsByProduct: jest.fn(),
  createReviewService: jest.fn(),
  getReviewById: jest.fn(),
}));

// Mock do auth-service para controlar autenticação nos testes
jest.unstable_mockModule('../services/auth-service.js', () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  logoutUser: jest.fn(),
  verifyToken: jest.fn(),
  isTokenBlacklisted: jest.fn(),
}));

// Mock do user-model para o auth-middleware encontrar o usuário
jest.unstable_mockModule('../models/user-model.js', () => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  createUser: jest.fn(),
}));

const { getReviewsByProduct, createReviewService } = await import('../services/review-service.js');
const { verifyToken, isTokenBlacklisted } = await import('../services/auth-service.js');
const { findById: findUserById } = await import('../models/user-model.js');
const { default: app } = await import('../server.js');

beforeEach(() => {
  jest.clearAllMocks();
});

/**
 * Função auxiliar para configurar mocks de autenticação.
 * Simula um usuário autenticado com token válido.
 */
function setupAuthenticatedUser(user = { id: 'user-1', name: 'Maria', email: 'maria@email.com' }) {
  verifyToken.mockReturnValue({ userId: user.id });
  isTokenBlacklisted.mockReturnValue(false);
  findUserById.mockResolvedValue(user);
  return user;
}

describe('GET /api/products/:id/reviews', () => {
  test('deve retornar 200 com avaliações paginadas', async () => {
    const mockResult = {
      reviews: [
        { id: 'rev-1', productId: 'prod-1', userId: 'user-1', text: 'Produto excelente, recomendo muito!', rating: 5, sentiment: 'positive' },
        { id: 'rev-2', productId: 'prod-1', userId: 'user-2', text: 'Qualidade razoável pelo preço', rating: 3, sentiment: 'neutral' },
      ],
      total: 2,
      page: 1,
      totalPages: 1,
    };
    getReviewsByProduct.mockResolvedValue(mockResult);

    const res = await request(app).get('/api/products/prod-1/reviews');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResult);
    expect(getReviewsByProduct).toHaveBeenCalledWith('prod-1', {
      sentiment: undefined,
      sort: undefined,
      page: undefined,
      pattern: undefined,
    });
  });

  test('deve retornar avaliações filtradas por sentimento positivo', async () => {
    const mockFiltered = {
      reviews: [
        { id: 'rev-1', productId: 'prod-1', userId: 'user-1', text: 'Produto excelente, recomendo muito!', rating: 5, sentiment: 'positive' },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
    };
    getReviewsByProduct.mockResolvedValue(mockFiltered);

    const res = await request(app).get('/api/products/prod-1/reviews?sentiment=positive');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockFiltered);
    expect(getReviewsByProduct).toHaveBeenCalledWith('prod-1', {
      sentiment: 'positive',
      sort: undefined,
      page: undefined,
      pattern: undefined,
    });
  });
});

describe('POST /api/products/:id/reviews', () => {
  const validReview = {
    text: 'Este produto é muito bom e recomendo para todos!',
    rating: 4,
  };

  test('deve retornar 201 com avaliação criada quando autenticado', async () => {
    const user = setupAuthenticatedUser();
    const mockCreated = {
      id: 'rev-1',
      productId: 'prod-1',
      userId: user.id,
      text: validReview.text,
      rating: validReview.rating,
      sentiment: null,
      createdAt: '2024-01-01T00:00:00.000Z',
    };
    createReviewService.mockResolvedValue(mockCreated);

    const res = await request(app)
      .post('/api/products/prod-1/reviews')
      .set('Authorization', 'Bearer token-valido')
      .send(validReview);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(mockCreated);
    expect(createReviewService).toHaveBeenCalledWith({
      productId: 'prod-1',
      userId: user.id,
      text: validReview.text,
      rating: validReview.rating,
    });
  });

  test('deve retornar 401 sem token de autenticação', async () => {
    const res = await request(app)
      .post('/api/products/prod-1/reviews')
      .send(validReview);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
    expect(createReviewService).not.toHaveBeenCalled();
  });

  test('deve retornar 422 com erros de validação para dados inválidos', async () => {
    const user = setupAuthenticatedUser();
    const { AppError } = await import('../middleware/error-middleware.js');

    // Simula erro de validação lançado pelo service
    createReviewService.mockRejectedValue(
      new AppError('VALIDATION_ERROR', 'Dados da avaliação inválidos', [
        { field: 'text', message: 'Texto da avaliação deve ter no mínimo 20 caracteres' },
        { field: 'rating', message: 'Nota deve ser um número inteiro entre 1 e 5' },
      ])
    );

    const res = await request(app)
      .post('/api/products/prod-1/reviews')
      .set('Authorization', 'Bearer token-valido')
      .send({ text: 'curto', rating: 0 });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'text' }),
        expect.objectContaining({ field: 'rating' }),
      ])
    );
  });
});
