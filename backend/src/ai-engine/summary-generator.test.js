// Testes unitários para summary-generator.js
// generateSummary é async (usa Ollama com fallback heurístico)
import { describe, it, expect, jest } from '@jest/globals';

// Mock do ollama-client — desativa Ollama nos testes para usar sempre o fallback heurístico
jest.unstable_mockModule('./ollama-client.js', () => ({
  isOllamaAvailable: async () => false,
  generate: async () => '',
}));

const { generateSummary } = await import('./summary-generator.js');

describe('generateSummary', () => {
  it('deve retornar arrays vazios para lista vazia', async () => {
    const result = await generateSummary([]);
    expect(result).toEqual({ positives: [], negatives: [] });
  });

  it('deve retornar arrays vazios para null', async () => {
    const result = await generateSummary(null);
    expect(result).toEqual({ positives: [], negatives: [] });
  });

  it('deve extrair pontos positivos de avaliações positivas', async () => {
    const reviews = [
      { text: 'Produto excelente. Recomendo para todos.', sentiment: 'positive' },
      { text: 'Ótima qualidade! Vale cada centavo.', sentiment: 'positive' },
    ];
    const result = await generateSummary(reviews);
    // Heurístico extrai frases com >= 15 chars: "Produto excelente", "Recomendo para todos", "Ótima qualidade", "Vale cada centavo"
    expect(result.positives.length).toBeGreaterThanOrEqual(2);
    expect(result.negatives).toHaveLength(0);
  });

  it('deve extrair pontos negativos de avaliações negativas', async () => {
    const reviews = [
      { text: 'Produto péssimo. Quebrou no primeiro dia.', sentiment: 'negative' },
      { text: 'Muito ruim! Não recomendo de jeito nenhum.', sentiment: 'negative' },
    ];
    const result = await generateSummary(reviews);
    expect(result.negatives.length).toBeGreaterThanOrEqual(2);
    expect(result.positives).toHaveLength(0);
  });

  it('deve separar positivos e negativos corretamente', async () => {
    const reviews = [
      { text: 'Adorei o produto. Muito bom.', sentiment: 'positive' },
      { text: 'Horrível, não funciona. Decepcionante.', sentiment: 'negative' },
      { text: 'Excelente qualidade. Recomendo.', sentiment: 'positive' },
    ];
    const result = await generateSummary(reviews);
    expect(result.positives).toHaveLength(2);
    expect(result.negatives).toHaveLength(1);
  });

  it('deve ignorar avaliações neutras', async () => {
    const reviews = [
      { text: 'Produto ok. Nada demais para falar.', sentiment: 'neutral' },
      { text: 'Produto muito bom mesmo. Recomendo bastante.', sentiment: 'positive' },
    ];
    const result = await generateSummary(reviews);
    expect(result.positives.length).toBeGreaterThanOrEqual(1);
    expect(result.negatives).toHaveLength(0);
  });

  it('deve limitar a 5 pontos positivos e 5 negativos', async () => {
    // Textos suficientemente diferentes para passar pelo filtro de diversidade (similaridade <= 0.5)
    const positiveTexts = [
      'Produto excelente com ótima qualidade de construção.',
      'Entrega muito rápida e embalagem bem protegida.',
      'Atendimento ao cliente foi excepcional e prestativo.',
      'Custo benefício surpreendente para o preço cobrado.',
      'Design moderno e acabamento impecável do material.',
      'Funciona perfeitamente desde o primeiro momento.',
      'Bateria dura bastante tempo sem precisar recarregar.',
      'Muito fácil de usar e configurar rapidamente.',
    ];
    const negativeTexts = [
      'Produto chegou com defeito visível na embalagem.',
      'Entrega atrasou mais de duas semanas sem aviso.',
      'Atendimento ao cliente foi péssimo e demorado.',
      'Qualidade muito inferior ao que foi anunciado.',
      'Parou de funcionar após apenas três dias de uso.',
      'Material frágil que quebrou facilmente na primeira semana.',
      'Não corresponde às fotos mostradas no anúncio.',
      'Suporte técnico inexistente para resolver problemas.',
    ];
    const reviews = [
      ...positiveTexts.map(text => ({ text, sentiment: 'positive' })),
      ...negativeTexts.map(text => ({ text, sentiment: 'negative' })),
    ];
    const result = await generateSummary(reviews);
    expect(result.positives).toHaveLength(5);
    expect(result.negatives).toHaveLength(5);
  });

  it('deve ignorar avaliações sem texto ou sentimento', async () => {
    const reviews = [
      { text: null, sentiment: 'positive' },
      { text: 'Produto muito bom mesmo.', sentiment: null },
      { text: '', sentiment: 'positive' },
      { text: 'Excelente produto recomendo muito!', sentiment: 'positive' },
    ];
    const result = await generateSummary(reviews);
    expect(result.positives.length).toBeGreaterThanOrEqual(1);
  });

  it('deve usar texto inteiro quando não há delimitador de frase', async () => {
    const reviews = [
      { text: 'Produto muito bom e de qualidade', sentiment: 'positive' },
    ];
    const result = await generateSummary(reviews);
    expect(result.positives[0]).toBe('Produto muito bom e de qualidade');
  });
});
