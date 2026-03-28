// Testes unitários para product-insight-model.js
import { jest, describe, it, expect, beforeEach, afterAll } from '@jest/globals';

const mockDb = {
  prepare: jest.fn(),
};

jest.unstable_mockModule('../database/connection.js', () => ({
  getDb: () => mockDb,
}));

const { upsertInsight, findByProductId } = await import('./product-insight-model.js');

beforeEach(() => {
  mockDb.prepare.mockReset();
});

describe('findByProductId', () => {
  it('deve retornar null quando insight não existe', async () => {
    mockDb.prepare.mockReturnValue({ get: jest.fn().mockReturnValue(undefined) });

    const result = await findByProductId('prod-123');
    expect(result).toBeNull();
  });

  it('deve retornar insight com campos JSON parseados', async () => {
    const row = {
      id: 'ins-1',
      productId: 'prod-123',
      summary: 'Resumo do produto',
      patterns: '{"strengths":["qualidade"],"weaknesses":["preço"]}',
      smartScore: 7.5,
      simpleAverage: 4.2,
      sentimentDistribution: '{"positive":60,"neutral":20,"negative":20}',
      reviewCountAtLastUpdate: 10,
      updatedAt: '2024-01-01',
    };
    mockDb.prepare.mockReturnValue({ get: jest.fn().mockReturnValue(row) });

    const result = await findByProductId('prod-123');

    expect(result.patterns).toEqual({ strengths: ['qualidade'], weaknesses: ['preço'] });
    expect(result.sentimentDistribution).toEqual({ positive: 60, neutral: 20, negative: 20 });
    expect(result.summary).toBe('Resumo do produto');
  });

  it('deve retornar patterns e sentimentDistribution como null quando são null no banco', async () => {
    const row = {
      id: 'ins-1',
      productId: 'prod-123',
      summary: null,
      patterns: null,
      smartScore: null,
      simpleAverage: null,
      sentimentDistribution: null,
      reviewCountAtLastUpdate: 0,
      updatedAt: '2024-01-01',
    };
    mockDb.prepare.mockReturnValue({ get: jest.fn().mockReturnValue(row) });

    const result = await findByProductId('prod-123');

    expect(result.patterns).toBeNull();
    expect(result.sentimentDistribution).toBeNull();
  });
});

describe('upsertInsight', () => {
  it('deve inserir novo insight quando não existe', async () => {
    const mockRun = jest.fn();
    const mockGet = jest.fn()
      // Primeira chamada: verifica se existe (não existe)
      .mockReturnValueOnce(undefined)
      // Segunda chamada: findByProductId após insert
      .mockReturnValueOnce({
        id: 'ins-1',
        productId: 'prod-123',
        summary: null,
        patterns: null,
        smartScore: null,
        simpleAverage: null,
        sentimentDistribution: '{"positive":50,"neutral":30,"negative":20}',
        reviewCountAtLastUpdate: 5,
        updatedAt: '2024-01-01',
      });

    mockDb.prepare.mockReturnValue({ get: mockGet, run: mockRun });

    const result = await upsertInsight('prod-123', {
      sentimentDistribution: { positive: 50, neutral: 30, negative: 20 },
      reviewCountAtLastUpdate: 5,
    });

    expect(mockRun).toHaveBeenCalled();
    expect(result.sentimentDistribution).toEqual({ positive: 50, neutral: 30, negative: 20 });
  });

  it('deve atualizar insight existente', async () => {
    const mockRun = jest.fn();
    const mockGet = jest.fn()
      // Primeira chamada: verifica se existe (existe)
      .mockReturnValueOnce({ id: 'ins-1' })
      // Segunda chamada: findByProductId após update
      .mockReturnValueOnce({
        id: 'ins-1',
        productId: 'prod-123',
        summary: 'Novo resumo',
        patterns: null,
        smartScore: null,
        simpleAverage: null,
        sentimentDistribution: null,
        reviewCountAtLastUpdate: 5,
        updatedAt: '2024-01-01',
      });

    mockDb.prepare.mockReturnValue({ get: mockGet, run: mockRun });

    const result = await upsertInsight('prod-123', { summary: 'Novo resumo' });

    expect(mockRun).toHaveBeenCalled();
    expect(result.summary).toBe('Novo resumo');
  });
});
