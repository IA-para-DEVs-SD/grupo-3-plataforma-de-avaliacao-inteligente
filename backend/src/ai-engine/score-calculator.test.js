// Testes unitários para score-calculator.js
import { describe, it, expect } from '@jest/globals';
import { calculateSmartScore } from './score-calculator.js';

describe('calculateSmartScore', () => {
  it('deve retornar 0.0 para lista vazia', () => {
    expect(calculateSmartScore([], null, null)).toBe(0.0);
  });

  it('deve retornar 0.0 para null', () => {
    expect(calculateSmartScore(null, null, null)).toBe(0.0);
  });

  it('deve retornar score no intervalo [0.0, 10.0]', () => {
    const reviews = [
      { rating: 5, createdAt: '2024-01-01' },
      { rating: 4, createdAt: '2024-01-02' },
      { rating: 3, createdAt: '2024-01-03' },
    ];
    const distribution = { positive: 60, neutral: 20, negative: 20 };
    const score = calculateSmartScore(reviews, distribution, null);
    expect(score).toBeGreaterThanOrEqual(0.0);
    expect(score).toBeLessThanOrEqual(10.0);
  });

  it('deve retornar score com 1 casa decimal', () => {
    const reviews = [
      { rating: 4, createdAt: '2024-01-01' },
      { rating: 3, createdAt: '2024-01-02' },
    ];
    const distribution = { positive: 50, neutral: 25, negative: 25 };
    const score = calculateSmartScore(reviews, distribution, null);
    const decimalPlaces = (score.toString().split('.')[1] || '').length;
    expect(decimalPlaces).toBeLessThanOrEqual(1);
  });

  it('deve dar score alto para avaliações todas positivas com nota 5', () => {
    const reviews = [
      { rating: 5, createdAt: '2024-01-01' },
      { rating: 5, createdAt: '2024-01-02' },
      { rating: 5, createdAt: '2024-01-03' },
    ];
    const distribution = { positive: 100, neutral: 0, negative: 0 };
    const score = calculateSmartScore(reviews, distribution, null);
    expect(score).toBeGreaterThanOrEqual(9.0);
  });

  it('deve dar score baixo para avaliações todas negativas com nota 1', () => {
    const reviews = [
      { rating: 1, createdAt: '2024-01-01' },
      { rating: 1, createdAt: '2024-01-02' },
      { rating: 1, createdAt: '2024-01-03' },
    ];
    const distribution = { positive: 0, neutral: 0, negative: 100 };
    const score = calculateSmartScore(reviews, distribution, null);
    expect(score).toBeLessThanOrEqual(1.0);
  });

  it('deve usar sentimento neutro (5.0) quando distribuição é null', () => {
    const reviews = [
      { rating: 3, createdAt: '2024-01-01' },
      { rating: 3, createdAt: '2024-01-02' },
      { rating: 3, createdAt: '2024-01-03' },
    ];
    const scoreWithNull = calculateSmartScore(reviews, null, null);
    const scoreWithNeutral = calculateSmartScore(reviews, { positive: 50, neutral: 0, negative: 50 }, null);
    // Ambos devem ter sentimento neutro (5.0), então scores devem ser iguais
    expect(scoreWithNull).toBe(scoreWithNeutral);
  });

  it('deve dar mais peso a avaliações recentes no componente de recência', () => {
    // Avaliações recentes boas, antigas ruins
    const reviewsRecentGood = [
      { rating: 1, createdAt: '2024-01-01' },
      { rating: 1, createdAt: '2024-01-02' },
      { rating: 5, createdAt: '2024-06-01' },
      { rating: 5, createdAt: '2024-06-02' },
    ];
    // Avaliações recentes ruins, antigas boas
    const reviewsRecentBad = [
      { rating: 5, createdAt: '2024-01-01' },
      { rating: 5, createdAt: '2024-01-02' },
      { rating: 1, createdAt: '2024-06-01' },
      { rating: 1, createdAt: '2024-06-02' },
    ];
    const dist = { positive: 50, neutral: 0, negative: 50 };
    const scoreRecentGood = calculateSmartScore(reviewsRecentGood, dist, null);
    const scoreRecentBad = calculateSmartScore(reviewsRecentBad, dist, null);
    // Score com avaliações recentes boas deve ser maior
    expect(scoreRecentGood).toBeGreaterThan(scoreRecentBad);
  });

  it('deve funcionar com uma única avaliação', () => {
    const reviews = [{ rating: 4, createdAt: '2024-01-01' }];
    const distribution = { positive: 100, neutral: 0, negative: 0 };
    const score = calculateSmartScore(reviews, distribution, null);
    expect(score).toBeGreaterThanOrEqual(0.0);
    expect(score).toBeLessThanOrEqual(10.0);
  });
});
