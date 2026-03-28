import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InsightCard from './InsightCard.jsx';

describe('InsightCard', () => {
  it('deve exibir pontos positivos e negativos quando summary está disponível', () => {
    const summary = {
      positives: ['Boa qualidade', 'Entrega rápida'],
      negatives: ['Preço alto'],
    };
    render(<InsightCard summary={summary} />);

    expect(screen.getByText('Boa qualidade')).toBeInTheDocument();
    expect(screen.getByText('Entrega rápida')).toBeInTheDocument();
    expect(screen.getByText('Preço alto')).toBeInTheDocument();
  });

  it('deve exibir mensagem de threshold quando summary é null', () => {
    render(<InsightCard summary={null} />);

    expect(screen.getByText('Resumo disponível após 5 avaliações')).toBeInTheDocument();
  });

  it('deve exibir mensagem de threshold quando summary tem listas vazias', () => {
    render(<InsightCard summary={{ positives: [], negatives: [] }} />);

    expect(screen.getByText('Resumo disponível após 5 avaliações')).toBeInTheDocument();
  });

  it('deve exibir apenas positivos quando negatives está vazio', () => {
    const summary = { positives: ['Durável'], negatives: [] };
    render(<InsightCard summary={summary} />);

    expect(screen.getByText('Durável')).toBeInTheDocument();
    expect(screen.queryByText('Pontos Negativos')).not.toBeInTheDocument();
  });

  it('deve ter aria-label acessível na seção', () => {
    render(<InsightCard summary={{ positives: ['Bom'], negatives: [] }} />);

    expect(screen.getByLabelText('Resumo de avaliações')).toBeInTheDocument();
  });
});
