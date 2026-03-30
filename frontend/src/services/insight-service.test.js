import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getInsights } from './insight-service.js';
import api from './api.js';

// Mock do módulo api
vi.mock('./api.js', () => ({
  default: { get: vi.fn() },
}));

describe('insight-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getInsights', () => {
    it('deve chamar GET /products/:id/insights e retornar insights', async () => {
      const mockInsights = {
        summary: { positives: ['Bom'], negatives: ['Caro'] },
        sentimentDistribution: { positive: 60, neutral: 20, negative: 20 },
        smartScore: 7.5,
        simpleAverage: 4.0,
      };
      api.get.mockResolvedValue({ data: { insights: mockInsights } });

      const result = await getInsights('prod-1');

      expect(api.get).toHaveBeenCalledWith('/products/prod-1/insights');
      expect(result).toEqual(mockInsights);
    });

    it('deve propagar erro quando a API falha', async () => {
      api.get.mockRejectedValue(new Error('Network Error'));

      await expect(getInsights('prod-1')).rejects.toThrow('Network Error');
    });
  });
});
