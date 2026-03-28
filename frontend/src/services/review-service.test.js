import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getReviews, createReview } from './review-service.js';
import api from './api.js';

// Mock da instância axios para isolar testes do backend real
vi.mock('./api.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('review-service.js — chamadas à API de avaliações', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getReviews', () => {
    it('deve enviar GET /products/:id/reviews e retornar dados paginados', async () => {
      const mockData = {
        reviews: [{ id: '1', text: 'Ótimo produto', rating: 5 }],
        total: 1,
        page: 1,
        totalPages: 1,
      };
      api.get.mockResolvedValueOnce({ data: mockData });

      const result = await getReviews('prod-1');

      expect(api.get).toHaveBeenCalledWith('/products/prod-1/reviews', { params: {} });
      expect(result).toEqual(mockData);
    });

    it('deve enviar parâmetros de filtro quando fornecidos', async () => {
      api.get.mockResolvedValueOnce({ data: { reviews: [], total: 0, page: 1, totalPages: 0 } });

      await getReviews('prod-1', { sentiment: 'positive', sort: 'rating_desc', page: 2, pattern: 'bateria' });

      expect(api.get).toHaveBeenCalledWith('/products/prod-1/reviews', {
        params: { sentiment: 'positive', sort: 'rating_desc', page: 2, pattern: 'bateria' },
      });
    });

    it('deve ignorar parâmetros vazios ou undefined', async () => {
      api.get.mockResolvedValueOnce({ data: { reviews: [], total: 0, page: 1, totalPages: 0 } });

      await getReviews('prod-1', { sentiment: '', sort: undefined, page: null });

      expect(api.get).toHaveBeenCalledWith('/products/prod-1/reviews', { params: {} });
    });

    it('deve propagar erro quando a API falha', async () => {
      api.get.mockRejectedValueOnce(new Error('Erro de rede'));

      await expect(getReviews('prod-1')).rejects.toThrow('Erro de rede');
    });
  });

  describe('createReview', () => {
    it('deve enviar POST /products/:id/reviews com texto e nota', async () => {
      const mockResponse = { id: 'rev-1', text: 'Produto excelente, recomendo muito!', rating: 5 };
      api.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await createReview('prod-1', { text: 'Produto excelente, recomendo muito!', rating: 5 });

      expect(api.post).toHaveBeenCalledWith('/products/prod-1/reviews', {
        text: 'Produto excelente, recomendo muito!',
        rating: 5,
      });
      expect(result).toEqual(mockResponse);
    });

    it('deve propagar erro quando a API rejeita a criação', async () => {
      api.post.mockRejectedValueOnce(new Error('Texto muito curto'));

      await expect(
        createReview('prod-1', { text: 'curto', rating: 3 })
      ).rejects.toThrow('Texto muito curto');
    });
  });
});
