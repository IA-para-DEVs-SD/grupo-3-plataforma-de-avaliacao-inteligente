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
    // "qualidade" aparece em 3 avaliações positivas → frequência >= 2 → detectado
    const reviews = [
      { text: 'Qualidade excelente do material', sentiment: 'positive' },
      { text: 'Material de qualidade superior', sentiment: 'positive' },
      { text: 'Qualidade impressionante do produto', sentiment: 'positive' },
    ];
    const result = detectPatterns(reviews);
    expect(result.strengths).toContain('qualidade');
    expect(result.weaknesses).toHaveLength(0);
  });

  it('deve extrair weaknesses de avaliações negativas', () => {
    // "entrega" aparece em 3 avaliações negativas → frequência >= 2 → detectado
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
    // Cada palavra aparece 3 vezes para garantir frequência >= 2
    const words = ['qualidade', 'material', 'design', 'acabamento', 'durabilidade', 'resistencia', 'conforto', 'praticidade'];
    const reviews = [];
    for (const word of words) {
      reviews.push({ text: `${word} ${word} ${word}`, sentiment: 'positive' });
    }
    const result = detectPatterns(reviews);
    expect(result.strengths.length).toBeLessThanOrEqual(5);
  });

  it('deve ignorar palavras curtas (< 4 caracteres)', () => {
    const reviews = [
      { text: 'bom sim top', sentiment: 'positive' },
      { text: 'bom sim top', sentiment: 'positive' },
    ];
    const result = detectPatterns(reviews);
    expect(result.strengths).toHaveLength(0);
  });

  it('deve ignorar avaliações sem texto ou sentimento', () => {
    // "qualidade" aparece 2x em avaliações válidas → detectado
    const reviews = [
      { text: null, sentiment: 'positive' },
      { text: 'Qualidade boa do produto', sentiment: null },
      { text: 'Excelente qualidade geral', sentiment: 'positive' },
      { text: 'Qualidade muito boa mesmo', sentiment: 'positive' },
    ];
    const result = detectPatterns(reviews);
    expect(result.strengths.length).toBeGreaterThan(0);
  });

  it('deve ignorar avaliações neutras', () => {
    // "qualidade" aparece 1x neutro + 2x positivo → só conta as positivas (freq >= 2)
    const reviews = [
      { text: 'Produto normal qualidade mediana', sentiment: 'neutral' },
      { text: 'Qualidade excelente recomendo', sentiment: 'positive' },
      { text: 'Qualidade muito boa mesmo', sentiment: 'positive' },
    ];
    const result = detectPatterns(reviews);
    expect(result.strengths).toContain('qualidade');
    expect(result.weaknesses).toHaveLength(0);
  });

  it('deve ordenar por frequência (mais frequente primeiro)', () => {
    // "qualidade" aparece 3x, "design" aparece 1x → qualidade deve ser primeiro
    const reviews = [
      { text: 'design bonito produto', sentiment: 'positive' },
      { text: 'qualidade excelente produto', sentiment: 'positive' },
      { text: 'qualidade superior material', sentiment: 'positive' },
      { text: 'qualidade impressionante mesmo', sentiment: 'positive' },
    ];
    const result = detectPatterns(reviews);
    expect(result.strengths[0]).toBe('qualidade');
  });
});
