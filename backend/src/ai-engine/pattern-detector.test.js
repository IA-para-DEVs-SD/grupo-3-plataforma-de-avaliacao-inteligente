// Testes unitários para pattern-detector.js
import { describe, it, expect } from '@jest/globals';
import { detectPatterns } from './pattern-detector.js';

describe('detectPatterns', () => {
  it('deve retornar arrays vazios para lista vazia', () => {
    const result = detectPatterns([]);
    expect(result).toEqual({ strengths: [], weaknesses: [] });
  });

  it('deve retornar arrays vazios para null', () => {
    const result = detectPatterns(null);
    expect(result).toEqual({ strengths: [], weaknesses: [] });
  });

  it('deve extrair strengths de avaliações positivas', () => {
    const reviews = [
      { text: 'Qualidade excelente do material', sentiment: 'positive' },
      { text: 'Material de qualidade superior', sentiment: 'positive' },
      { text: 'Qualidade impressionante', sentiment: 'positive' },
    ];
    const result = detectPatterns(reviews);
    expect(result.strengths).toContain('qualidade');
    expect(result.weaknesses).toHaveLength(0);
  });

  it('deve extrair weaknesses de avaliações negativas', () => {
    const reviews = [
      { text: 'Entrega atrasada demais', sentiment: 'negative' },
      { text: 'Problema com entrega novamente', sentiment: 'negative' },
      { text: 'Entrega demorou muito tempo', sentiment: 'negative' },
    ];
    const result = detectPatterns(reviews);
    expect(result.weaknesses).toContain('entrega');
    expect(result.strengths).toHaveLength(0);
  });

  it('deve separar strengths e weaknesses corretamente', () => {
    const reviews = [
      { text: 'Qualidade excelente do produto', sentiment: 'positive' },
      { text: 'Qualidade muito boa mesmo', sentiment: 'positive' },
      { text: 'Entrega atrasada demais', sentiment: 'negative' },
      { text: 'Entrega demorou muito', sentiment: 'negative' },
    ];
    const result = detectPatterns(reviews);
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.weaknesses.length).toBeGreaterThan(0);
  });

  it('deve limitar a 5 padrões por categoria', () => {
    // Cria avaliações com muitas palavras diferentes
    const reviews = [];
    const words = ['qualidade', 'material', 'design', 'acabamento', 'durabilidade', 'resistência', 'conforto', 'praticidade'];
    for (const word of words) {
      reviews.push({ text: `${word} ${word} ${word}`, sentiment: 'positive' });
    }
    const result = detectPatterns(reviews);
    expect(result.strengths.length).toBeLessThanOrEqual(5);
  });

  it('deve ignorar palavras curtas (< 4 caracteres)', () => {
    const reviews = [
      { text: 'bom sim top', sentiment: 'positive' },
    ];
    const result = detectPatterns(reviews);
    expect(result.strengths).toHaveLength(0);
  });

  it('deve ignorar avaliações sem texto ou sentimento', () => {
    const reviews = [
      { text: null, sentiment: 'positive' },
      { text: 'Qualidade boa do produto', sentiment: null },
      { text: 'Excelente qualidade geral', sentiment: 'positive' },
    ];
    const result = detectPatterns(reviews);
    expect(result.strengths.length).toBeGreaterThan(0);
  });

  it('deve ignorar avaliações neutras', () => {
    const reviews = [
      { text: 'Produto normal qualidade mediana', sentiment: 'neutral' },
      { text: 'Qualidade excelente recomendo', sentiment: 'positive' },
    ];
    const result = detectPatterns(reviews);
    // "qualidade" aparece em ambas, mas só a positiva conta
    expect(result.strengths).toContain('qualidade');
    expect(result.weaknesses).toHaveLength(0);
  });

  it('deve ordenar por frequência (mais frequente primeiro)', () => {
    const reviews = [
      { text: 'design bonito', sentiment: 'positive' },
      { text: 'qualidade excelente', sentiment: 'positive' },
      { text: 'qualidade superior', sentiment: 'positive' },
      { text: 'qualidade impressionante', sentiment: 'positive' },
    ];
    const result = detectPatterns(reviews);
    expect(result.strengths[0]).toBe('qualidade');
  });
});
