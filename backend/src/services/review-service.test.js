// Testes unitários para review-service.js
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock dos models antes de importar o service
const mockCreateReview = jest.fn();
const mockFindByProductId = jest.fn();
const mockFindReviewById = jest.fn();
const mockUpdateSentiment = jest.fn();
const mockFindProductById = jest.fn();
const mockEnqueue = jest.fn();
const mockAnalyzeSentiment = jest.fn();
const mockRecalculateSentimentDistribution = jest.fn();
const mockRecalculateScore = jest.fn();
const mockRegenerateSummary = jest.fn();
const mockReanalyzePatterns = jest.fn();

jest.unstable_mockModule('../models/review-model.js', () => ({
  createReview: mockCreateReview,
  findByProductId: mockFindByProductId,
  findById: mockFindReviewById,
  updateSentiment: mockUpdateSentiment,
}));

jest.unstable_mockModule('../models/product-model.js', () => ({
  findById: mockFindProductById,
}));

jest.unstable_mockModule('../ai-engine/ai-queue.js', () => ({
  enqueue: mockEnqueue,
}));

jest.unstable_mockModule('../ai-engine/sentiment-analyzer.js', () => ({
  analyzeSentiment: mockAnalyzeSentiment,
}));

jest.unstable_mockModule('./insight-service.js', () => ({
  recalculateSentimentDistribution: mockRecalculateSentimentDistribution,
  recalculateScore: mockRecalculateScore,
  regenerateSummary: mockRegenerateSummary,
  reanalyzePatterns: mockReanalyzePatterns,
}));

// Importa review-service após configurar os mocks
const {
  createReviewService,
  getReviewsByProduct,
  getReviewById,
} = await import('./review-service.js');

beforeEach(() => {
  mockCreateReview.mockReset();
  mockFindByProductId.mockReset();
  mockFindReviewById.mockReset();
  mockFindProductById.mockReset();
  mockUpdateSentiment.mockReset();
  mockEnqueue.mockReset();
  mockAnalyzeSentiment.mockReset();
  mockRecalculateSentimentDistribution.mockReset();
  mockRecalculateScore.mockReset();
  mockRegenerateSummary.mockReset();
  mockReanalyzePatterns.mockReset();
});

describe('createReviewService', () => {
  const validData = {
    productId: 'prod-123',
    userId: 'user-456',
    text: 'Este produto é excelente, recomendo para todos!',
    rating: 4,
  };

  const fakeProduct = { id: 'prod-123', name: 'Teclado Mecânico' };

  it('deve criar uma avaliação com dados válidos', async () => {
    mockFindProductById.mockResolvedValue(fakeProduct);
    const fakeReview = { id: 'rev-1', ...validData, sentiment: null, createdAt: '2024-01-01' };
    mockCreateReview.mockResolvedValue(fakeReview);

    const result = await createReviewService(validData);

    expect(result).toEqual(fakeReview);
    expect(mockFindProductById).toHaveBeenCalledWith('prod-123');
    expect(mockCreateReview).toHaveBeenCalledWith({
      productId: 'prod-123',
      userId: 'user-456',
      text: 'Este produto é excelente, recomendo para todos!',
      rating: 4,
    });
  });

  it('deve fazer trim no texto da avaliação', async () => {
    mockFindProductById.mockResolvedValue(fakeProduct);
    mockCreateReview.mockResolvedValue({ id: 'rev-2' });

    await createReviewService({
      ...validData,
      text: '  Este produto é excelente, recomendo para todos!  ',
    });

    expect(mockCreateReview).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'Este produto é excelente, recomendo para todos!',
      })
    );
  });

  // --- Validação de texto ---

  it('deve lançar VALIDATION_ERROR quando texto tem menos de 20 caracteres', async () => {
    await expect(
      createReviewService({ ...validData, text: 'Texto curto' })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      statusCode: 422,
    });

    expect(mockCreateReview).not.toHaveBeenCalled();
  });

  it('deve lançar VALIDATION_ERROR quando texto é apenas espaços', async () => {
    await expect(
      createReviewService({ ...validData, text: '                    ' })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });

  it('deve lançar VALIDATION_ERROR quando texto é vazio', async () => {
    await expect(
      createReviewService({ ...validData, text: '' })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });

  it('deve lançar VALIDATION_ERROR quando texto é null', async () => {
    await expect(
      createReviewService({ ...validData, text: null })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });

  it('deve aceitar texto com exatamente 20 caracteres após trim', async () => {
    mockFindProductById.mockResolvedValue(fakeProduct);
    mockCreateReview.mockResolvedValue({ id: 'rev-3' });

    // 20 caracteres exatos
    const text20 = 'a'.repeat(20);
    await createReviewService({ ...validData, text: text20 });

    expect(mockCreateReview).toHaveBeenCalled();
  });

  // --- Validação de nota ---

  it('deve lançar VALIDATION_ERROR quando nota é 0', async () => {
    await expect(
      createReviewService({ ...validData, rating: 0 })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });

  it('deve lançar VALIDATION_ERROR quando nota é 6', async () => {
    await expect(
      createReviewService({ ...validData, rating: 6 })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });

  it('deve lançar VALIDATION_ERROR quando nota é negativa', async () => {
    await expect(
      createReviewService({ ...validData, rating: -1 })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });

  it('deve lançar VALIDATION_ERROR quando nota é decimal', async () => {
    await expect(
      createReviewService({ ...validData, rating: 3.5 })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });

  it('deve lançar VALIDATION_ERROR quando nota é null', async () => {
    await expect(
      createReviewService({ ...validData, rating: null })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });

  it('deve lançar VALIDATION_ERROR quando nota é undefined', async () => {
    await expect(
      createReviewService({ ...validData, rating: undefined })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });

  // --- Validação de produto ---

  it('deve lançar NOT_FOUND quando produto não existe', async () => {
    mockFindProductById.mockResolvedValue(null);

    await expect(
      createReviewService(validData)
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      statusCode: 404,
    });

    expect(mockCreateReview).not.toHaveBeenCalled();
  });

  // --- Múltiplos erros de validação ---

  it('deve incluir detalhes dos campos inválidos no erro', async () => {
    try {
      await createReviewService({ ...validData, text: 'curto', rating: 10 });
    } catch (err) {
      expect(err.details).toHaveLength(2);
      expect(err.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'text' }),
          expect.objectContaining({ field: 'rating' }),
        ])
      );
    }
  });
});

describe('getReviewsByProduct', () => {
  it('deve retornar avaliações paginadas do produto', async () => {
    const fakeResult = {
      reviews: [{ id: 'rev-1', text: 'Ótimo produto' }],
      total: 1,
      page: 1,
      totalPages: 1,
    };
    mockFindByProductId.mockResolvedValue(fakeResult);

    const result = await getReviewsByProduct('prod-123');

    expect(result).toEqual(fakeResult);
    expect(mockFindByProductId).toHaveBeenCalledWith('prod-123', {});
  });

  it('deve passar opções de filtro para o model', async () => {
    const options = { sentiment: 'positive', sort: 'rating_desc', page: 2 };
    mockFindByProductId.mockResolvedValue({ reviews: [], total: 0, page: 2, totalPages: 0 });

    await getReviewsByProduct('prod-123', options);

    expect(mockFindByProductId).toHaveBeenCalledWith('prod-123', options);
  });

  it('deve passar opção de pattern para o model', async () => {
    const options = { pattern: 'bateria' };
    mockFindByProductId.mockResolvedValue({ reviews: [], total: 0, page: 1, totalPages: 0 });

    await getReviewsByProduct('prod-123', options);

    expect(mockFindByProductId).toHaveBeenCalledWith('prod-123', options);
  });
});

describe('getReviewById', () => {
  it('deve retornar a avaliação quando encontrada', async () => {
    const fakeReview = { id: 'rev-1', text: 'Ótimo produto', rating: 5 };
    mockFindReviewById.mockResolvedValue(fakeReview);

    const result = await getReviewById('rev-1');

    expect(result).toEqual(fakeReview);
    expect(mockFindReviewById).toHaveBeenCalledWith('rev-1');
  });

  it('deve lançar NOT_FOUND quando avaliação não existe', async () => {
    mockFindReviewById.mockResolvedValue(null);

    await expect(
      getReviewById('inexistente')
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      statusCode: 404,
    });
  });
});
