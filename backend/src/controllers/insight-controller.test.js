// Testes de integração para o endpoint de insights e filtragem por padrão
// Cobre tasks 5.6.6 (GET /api/products/:id/insights) e 5.6.10 (GET /api/products/:id/reviews?pattern=term)
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';

// Mock do insight-service para isolar os testes de rota
jest.unstable_mockModule('../services/insight-service.js', () => ({
  getInsights: jest.fn(),
  recalculateSentimentDistribution: jest.fn(),
  regenerateSummary: jest.fn(),
  reanalyzePatterns: jest.fn(),
  recalculateScore: jest.fn(),
}));

// Mock do review-service para testes de filtragem por padrão
jest.unstable_mockModule('../services/review-service.js', () => ({
  getReviewsByProduct: jest.fn(),
  createReviewService: jest.fn(),
  getReviewById: jest.fn(),
}));

// Mock do product-service (necessário para rotas de produto)
jest.unstable_mockModule('../services/product-service.js', () => ({
  searchProducts: jest.fn(),
  getProductById: jest.fn(),
  createProductService: jest.fn(),
}));

// Mock do auth-service para controlar autenticação nos testes
jest.unstable_mockModule('../services/auth-service.js', () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  logoutUser: jest.fn(),
  verifyToken: jest.fn(),
  isTokenBlacklisted: jest.fn(),
}));

// Mock do user-model para o auth-middleware
jest.unstable_mockModule('../models/user-model.js', () => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  createUser: jest.fn(),
}));

const { getInsights } = await import('../services/insight-service.js');
const { getReviewsByProduct } = await import('../services/review-service.js');
const { default: app } = await import('../server.js');

beforeEach(() => {
  jest.clearAllMocks();
});

// =============================================================================
// 5.6.6 — Testes de integração para GET /api/products/:id/insights
// =============================================================================
describe('GET /api/products/:id/insights', () => {
  test('deve retornar 200 com insights completos quando existem', async () => {
    const mockInsights = {
      id: 'ins-1',
      productId: 'prod-1',
      summary: '{"positives":["Boa qualidade"],"negatives":["Entrega lenta"]}',
      patterns: { strengths: ['qualidade', 'durável'], weaknesses: ['entrega'] },
      smartScore: 7.5,
      simpleAverage: 4.2,
      sentimentDistribution: { positive: 60, neutral: 20, negative: 20 },
      reviewCountAtLastUpdate: 15,
      updatedAt: '2024-06-01 12:00:00',
    };
    getInsights.mockResolvedValue(mockInsights);

    const res = await request(app).get('/api/products/prod-1/insights');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ insights: mockInsights });
    expect(getInsights).toHaveBeenCalledWith('prod-1');
  });

  test('deve retornar 200 com insights null quando produto não tem insights', async () => {
    getInsights.mockResolvedValue(null);

    const res = await request(app).get('/api/products/prod-999/insights');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ insights: null });
    expect(getInsights).toHaveBeenCalledWith('prod-999');
  });

  test('deve retornar 200 com insights parciais (apenas sentimento, sem resumo)', async () => {
    const mockPartial = {
      id: 'ins-2',
      productId: 'prod-2',
      summary: null,
      patterns: null,
      smartScore: null,
      simpleAverage: null,
      sentimentDistribution: { positive: 50, neutral: 25, negative: 25 },
      reviewCountAtLastUpdate: 3,
      updatedAt: '2024-06-01 10:00:00',
    };
    getInsights.mockResolvedValue(mockPartial);

    const res = await request(app).get('/api/products/prod-2/insights');

    expect(res.status).toBe(200);
    expect(res.body.insights).toEqual(mockPartial);
    expect(res.body.insights.summary).toBeNull();
    expect(res.body.insights.patterns).toBeNull();
    expect(res.body.insights.sentimentDistribution).not.toBeNull();
  });

  test('deve retornar 500 quando o serviço lança erro interno', async () => {
    getInsights.mockRejectedValue(new Error('Erro interno do banco'));

    const res = await request(app).get('/api/products/prod-1/insights');

    expect(res.status).toBe(500);
  });
});

// =============================================================================
// 5.6.10 — Testes de integração para filtragem por padrão
// GET /api/products/:id/reviews?pattern=term
// =============================================================================
describe('GET /api/products/:id/reviews?pattern=term', () => {
  test('deve retornar 200 com avaliações filtradas pelo padrão', async () => {
    const mockFiltered = {
      reviews: [
        { id: 'rev-1', productId: 'prod-1', text: 'A qualidade do material é excelente', rating: 5, sentiment: 'positive' },
        { id: 'rev-3', productId: 'prod-1', text: 'Qualidade boa mas poderia melhorar', rating: 3, sentiment: 'neutral' },
      ],
      total: 2,
      page: 1,
      totalPages: 1,
    };
    getReviewsByProduct.mockResolvedValue(mockFiltered);

    const res = await request(app).get('/api/products/prod-1/reviews?pattern=qualidade');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockFiltered);
    expect(getReviewsByProduct).toHaveBeenCalledWith('prod-1', {
      sentiment: undefined,
      sort: undefined,
      page: undefined,
      pattern: 'qualidade',
    });
  });

  test('deve retornar lista vazia quando nenhuma avaliação menciona o padrão', async () => {
    const mockEmpty = {
      reviews: [],
      total: 0,
      page: 1,
      totalPages: 0,
    };
    getReviewsByProduct.mockResolvedValue(mockEmpty);

    const res = await request(app).get('/api/products/prod-1/reviews?pattern=inexistente');

    expect(res.status).toBe(200);
    expect(res.body.reviews).toEqual([]);
    expect(res.body.total).toBe(0);
    expect(getReviewsByProduct).toHaveBeenCalledWith('prod-1', {
      sentiment: undefined,
      sort: undefined,
      page: undefined,
      pattern: 'inexistente',
    });
  });

  test('deve combinar filtro de padrão com filtro de sentimento', async () => {
    const mockCombined = {
      reviews: [
        { id: 'rev-1', productId: 'prod-1', text: 'A qualidade é excelente', rating: 5, sentiment: 'positive' },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
    };
    getReviewsByProduct.mockResolvedValue(mockCombined);

    const res = await request(app).get('/api/products/prod-1/reviews?pattern=qualidade&sentiment=positive');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockCombined);
    expect(getReviewsByProduct).toHaveBeenCalledWith('prod-1', {
      sentiment: 'positive',
      sort: undefined,
      page: undefined,
      pattern: 'qualidade',
    });
  });

  test('deve combinar filtro de padrão com paginação', async () => {
    const mockPaginated = {
      reviews: [
        { id: 'rev-11', productId: 'prod-1', text: 'Qualidade do produto é boa', rating: 4, sentiment: 'positive' },
      ],
      total: 11,
      page: 2,
      totalPages: 2,
    };
    getReviewsByProduct.mockResolvedValue(mockPaginated);

    const res = await request(app).get('/api/products/prod-1/reviews?pattern=qualidade&page=2');

    expect(res.status).toBe(200);
    expect(res.body.page).toBe(2);
    expect(getReviewsByProduct).toHaveBeenCalledWith('prod-1', {
      sentiment: undefined,
      sort: undefined,
      page: '2',
      pattern: 'qualidade',
    });
  });
});
