// Testes unitários para insight-service.js
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockFindAllByProductId = jest.fn();
const mockUpsertInsight = jest.fn();
const mockFindByProductId = jest.fn();

jest.unstable_mockModule('../models/review-model.js', () => ({
  findAllByProductId: mockFindAllByProductId,
}));

jest.unstable_mockModule('../models/product-insight-model.js', () => ({
  upsertInsight: mockUpsertInsight,
  findByProductId: mockFindByProductId,
}));

// Mock dos módulos de IA — usamos implementações reais via passthrough
jest.unstable_mockModule('../ai-engine/summary-generator.js', () => ({
  generateSummary: jest.fn((reviews) => {
    const positives = reviews.filter(r => r.sentiment === 'positive').map(r => r.text).slice(0, 5);
    const negatives = reviews.filter(r => r.sentiment === 'negative').map(r => r.text).slice(0, 5);
    return { positives, negatives };
  }),
}));

jest.unstable_mockModule('../ai-engine/pattern-detector.js', () => ({
  detectPatterns: jest.fn((reviews) => ({
    strengths: ['qualidade'],
    weaknesses: ['entrega'],
  })),
}));

jest.unstable_mockModule('../ai-engine/score-calculator.js', () => ({
  calculateSmartScore: jest.fn(() => 7.5),
}));

const {
  recalculateSentimentDistribution,
  getInsights,
  regenerateSummary,
  reanalyzePatterns,
  recalculateScore,
} = await import('./insight-service.js');

beforeEach(() => {
  mockFindAllByProductId.mockReset();
  mockUpsertInsight.mockReset();
  mockFindByProductId.mockReset();
});

describe('recalculateSentimentDistribution', () => {
  it('deve retornar null quando não há avaliações classificadas', async () => {
    mockFindAllByProductId.mockResolvedValue([
      { id: '1', sentiment: null },
      { id: '2', sentiment: null },
    ]);

    const result = await recalculateSentimentDistribution('prod-123');
    expect(result).toBeNull();
  });

  it('deve calcular distribuição corretamente com avaliações mistas', async () => {
    mockFindAllByProductId.mockResolvedValue([
      { id: '1', sentiment: 'positive' },
      { id: '2', sentiment: 'positive' },
      { id: '3', sentiment: 'neutral' },
      { id: '4', sentiment: 'negative' },
    ]);
    mockUpsertInsight.mockResolvedValue({ sentimentDistribution: { positive: 50, neutral: 25, negative: 25 } });

    await recalculateSentimentDistribution('prod-123');

    expect(mockUpsertInsight).toHaveBeenCalledWith('prod-123', expect.objectContaining({
      sentimentDistribution: expect.objectContaining({
        positive: 50,
        neutral: 25,
        negative: 25,
      }),
      reviewCountAtLastUpdate: 4,
    }));
  });

  it('deve calcular 100% positivo quando todas são positivas', async () => {
    mockFindAllByProductId.mockResolvedValue([
      { id: '1', sentiment: 'positive' },
      { id: '2', sentiment: 'positive' },
    ]);
    mockUpsertInsight.mockResolvedValue({});

    await recalculateSentimentDistribution('prod-123');

    expect(mockUpsertInsight).toHaveBeenCalledWith('prod-123', expect.objectContaining({
      sentimentDistribution: { positive: 100, neutral: 0, negative: 0 },
    }));
  });

  it('deve ignorar avaliações sem sentimento classificado', async () => {
    mockFindAllByProductId.mockResolvedValue([
      { id: '1', sentiment: 'positive' },
      { id: '2', sentiment: null },
      { id: '3', sentiment: 'negative' },
    ]);
    mockUpsertInsight.mockResolvedValue({});

    await recalculateSentimentDistribution('prod-123');

    expect(mockUpsertInsight).toHaveBeenCalledWith('prod-123', expect.objectContaining({
      sentimentDistribution: { positive: 50, neutral: 0, negative: 50 },
      reviewCountAtLastUpdate: 3,
    }));
  });
});

describe('getInsights', () => {
  it('deve retornar insight quando existe', async () => {
    const fakeInsight = { id: 'ins-1', productId: 'prod-123', summary: 'Resumo' };
    mockFindByProductId.mockResolvedValue(fakeInsight);

    const result = await getInsights('prod-123');
    expect(result).toEqual(fakeInsight);
  });

  it('deve retornar null quando insight não existe', async () => {
    mockFindByProductId.mockResolvedValue(null);

    const result = await getInsights('prod-999');
    expect(result).toBeNull();
  });
});

describe('regenerateSummary', () => {
  it('deve retornar null quando há menos de 5 avaliações', async () => {
    mockFindAllByProductId.mockResolvedValue([
      { id: '1', text: 'Bom produto', sentiment: 'positive', rating: 4 },
      { id: '2', text: 'Ruim', sentiment: 'negative', rating: 2 },
    ]);

    const result = await regenerateSummary('prod-123');
    expect(result).toBeNull();
    expect(mockUpsertInsight).not.toHaveBeenCalled();
  });

  it('deve gerar resumo quando há 5 ou mais avaliações', async () => {
    const reviews = Array.from({ length: 5 }, (_, i) => ({
      id: `${i}`,
      text: `Avaliação número ${i} do produto`,
      sentiment: i < 3 ? 'positive' : 'negative',
      rating: i < 3 ? 5 : 2,
    }));
    mockFindAllByProductId.mockResolvedValue(reviews);
    mockUpsertInsight.mockResolvedValue({ summary: '{}' });

    await regenerateSummary('prod-123');

    expect(mockUpsertInsight).toHaveBeenCalledWith('prod-123', expect.objectContaining({
      summary: expect.any(String),
      reviewCountAtLastUpdate: 5,
    }));
  });

  it('deve filtrar avaliações sem sentimento antes de gerar resumo', async () => {
    const reviews = [
      { id: '1', text: 'Excelente produto', sentiment: 'positive', rating: 5 },
      { id: '2', text: 'Muito bom', sentiment: 'positive', rating: 4 },
      { id: '3', text: 'Sem classificação', sentiment: null, rating: 3 },
      { id: '4', text: 'Ruim demais', sentiment: 'negative', rating: 1 },
      { id: '5', text: 'Péssimo', sentiment: 'negative', rating: 1 },
    ];
    mockFindAllByProductId.mockResolvedValue(reviews);
    mockUpsertInsight.mockResolvedValue({});

    await regenerateSummary('prod-123');

    expect(mockUpsertInsight).toHaveBeenCalled();
  });
});

describe('reanalyzePatterns', () => {
  it('deve retornar null quando há menos de 10 avaliações', async () => {
    mockFindAllByProductId.mockResolvedValue(
      Array.from({ length: 9 }, (_, i) => ({
        id: `${i}`, text: `Review ${i}`, sentiment: 'positive', rating: 4,
      }))
    );

    const result = await reanalyzePatterns('prod-123');
    expect(result).toBeNull();
    expect(mockUpsertInsight).not.toHaveBeenCalled();
  });

  it('deve detectar padrões quando há 10 ou mais avaliações', async () => {
    const reviews = Array.from({ length: 10 }, (_, i) => ({
      id: `${i}`,
      text: `Avaliação com qualidade número ${i}`,
      sentiment: i < 7 ? 'positive' : 'negative',
      rating: i < 7 ? 5 : 2,
    }));
    mockFindAllByProductId.mockResolvedValue(reviews);
    mockUpsertInsight.mockResolvedValue({});

    await reanalyzePatterns('prod-123');

    expect(mockUpsertInsight).toHaveBeenCalledWith('prod-123', expect.objectContaining({
      patterns: expect.objectContaining({
        strengths: expect.any(Array),
        weaknesses: expect.any(Array),
      }),
      reviewCountAtLastUpdate: 10,
    }));
  });
});

describe('recalculateScore', () => {
  it('deve retornar null quando há menos de 3 avaliações', async () => {
    mockFindAllByProductId.mockResolvedValue([
      { id: '1', text: 'Bom', sentiment: 'positive', rating: 4 },
      { id: '2', text: 'Ruim', sentiment: 'negative', rating: 2 },
    ]);

    const result = await recalculateScore('prod-123');
    expect(result).toBeNull();
    expect(mockUpsertInsight).not.toHaveBeenCalled();
  });

  it('deve calcular score e média simples quando há 3 ou mais avaliações', async () => {
    const reviews = [
      { id: '1', text: 'Bom', sentiment: 'positive', rating: 5, createdAt: '2024-01-01' },
      { id: '2', text: 'Ok', sentiment: 'neutral', rating: 3, createdAt: '2024-01-02' },
      { id: '3', text: 'Ruim', sentiment: 'negative', rating: 1, createdAt: '2024-01-03' },
    ];
    mockFindAllByProductId.mockResolvedValue(reviews);
    mockFindByProductId.mockResolvedValue({
      sentimentDistribution: { positive: 33.3, neutral: 33.3, negative: 33.4 },
      patterns: null,
    });
    mockUpsertInsight.mockResolvedValue({});

    await recalculateScore('prod-123');

    expect(mockUpsertInsight).toHaveBeenCalledWith('prod-123', expect.objectContaining({
      smartScore: expect.any(Number),
      simpleAverage: 3,
      reviewCountAtLastUpdate: 3,
    }));
  });

  it('deve calcular média simples corretamente', async () => {
    const reviews = [
      { id: '1', rating: 4, createdAt: '2024-01-01' },
      { id: '2', rating: 5, createdAt: '2024-01-02' },
      { id: '3', rating: 3, createdAt: '2024-01-03' },
    ];
    mockFindAllByProductId.mockResolvedValue(reviews);
    mockFindByProductId.mockResolvedValue(null);
    mockUpsertInsight.mockResolvedValue({});

    await recalculateScore('prod-123');

    // Média: (4+5+3)/3 = 4.0
    expect(mockUpsertInsight).toHaveBeenCalledWith('prod-123', expect.objectContaining({
      simpleAverage: 4,
    }));
  });
});
