// Testes unitários para summary-generator.js
import { describe, it, expect } from '@jest/globals';
import { generateSummary } from './summary-generator.js';

describe('generateSummary', () => {
  it('deve retornar arrays vazios para lista vazia', () => {
    const result = generateSummary([]);
    expect(result).toEqual({ positives: [], negatives: [] });
  });

  it('deve retornar arrays vazios para null', () => {
    const result = generateSummary(null);
    expect(result).toEqual({ positives: [], negatives: [] });
  });

  it('deve extrair pontos positivos de avaliações positivas', () => {
    const reviews = [
      { text: 'Produto excelente. Recomendo para todos.', sentiment: 'positive' },
      { text: 'Ótima qualidade! Vale cada centavo.', sentiment: 'positive' },
    ];
    const result = generateSummary(reviews);
    expect(result.positives).toHaveLength(2);
    expect(result.positives[0]).toBe('Produto excelente.');
    expect(result.positives[1]).toBe('Ótima qualidade!');
    expect(result.negatives).toHaveLength(0);
  });

  it('deve extrair pontos negativos de avaliações negativas', () => {
    const reviews = [
      { text: 'Produto péssimo. Quebrou no primeiro dia.', sentiment: 'negative' },
      { text: 'Muito ruim! Não recomendo.', sentiment: 'negative' },
    ];
    const result = generateSummary(reviews);
    expect(result.negatives).toHaveLength(2);
    expect(result.negatives[0]).toBe('Produto péssimo.');
    expect(result.negatives[1]).toBe('Muito ruim!');
    expect(result.positives).toHaveLength(0);
  });

  it('deve separar positivos e negativos corretamente', () => {
    const reviews = [
      { text: 'Adorei o produto. Muito bom.', sentiment: 'positive' },
      { text: 'Horrível, não funciona. Decepcionante.', sentiment: 'negative' },
      { text: 'Excelente qualidade. Recomendo.', sentiment: 'positive' },
    ];
    const result = generateSummary(reviews);
    expect(result.positives).toHaveLength(2);
    expect(result.negatives).toHaveLength(1);
  });

  it('deve ignorar avaliações neutras', () => {
    const reviews = [
      { text: 'Produto ok. Nada demais.', sentiment: 'neutral' },
      { text: 'Bom produto. Gostei.', sentiment: 'positive' },
    ];
    const result = generateSummary(reviews);
    expect(result.positives).toHaveLength(1);
    expect(result.negatives).toHaveLength(0);
  });

  it('deve limitar a 5 pontos positivos e 5 negativos', () => {
    const reviews = [];
    for (let i = 0; i < 8; i++) {
      reviews.push({ text: `Ponto positivo ${i}. Detalhe.`, sentiment: 'positive' });
      reviews.push({ text: `Ponto negativo ${i}. Detalhe.`, sentiment: 'negative' });
    }
    const result = generateSummary(reviews);
    expect(result.positives).toHaveLength(5);
    expect(result.negatives).toHaveLength(5);
  });

  it('deve ignorar avaliações sem texto ou sentimento', () => {
    const reviews = [
      { text: null, sentiment: 'positive' },
      { text: 'Bom produto. Gostei.', sentiment: null },
      { text: '', sentiment: 'positive' },
      { text: 'Excelente! Recomendo.', sentiment: 'positive' },
    ];
    const result = generateSummary(reviews);
    expect(result.positives).toHaveLength(1);
    expect(result.positives[0]).toBe('Excelente!');
  });

  it('deve usar texto inteiro quando não há delimitador de frase', () => {
    const reviews = [
      { text: 'Produto muito bom e de qualidade', sentiment: 'positive' },
    ];
    const result = generateSummary(reviews);
    expect(result.positives[0]).toBe('Produto muito bom e de qualidade');
  });
});
