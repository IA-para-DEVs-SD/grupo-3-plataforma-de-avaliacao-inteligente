import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReviewCard from './ReviewCard.jsx';

describe('ReviewCard — exibição de avaliação individual', () => {
  const baseReview = {
    id: '1',
    text: 'Produto excelente, superou minhas expectativas!',
    rating: 4,
    userName: 'Maria Silva',
    createdAt: '2024-03-15T10:30:00Z',
    sentiment: null,
  };

  it('deve exibir texto, autor, data e estrelas', () => {
    render(<ReviewCard review={baseReview} />);

    expect(screen.getByText(baseReview.text)).toBeInTheDocument();
    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    expect(screen.getByText('15/03/2024')).toBeInTheDocument();
    expect(screen.getByLabelText('Nota: 4 de 5')).toHaveTextContent('★★★★☆');
  });

  it('deve exibir badge verde para sentimento positivo', () => {
    render(<ReviewCard review={{ ...baseReview, sentiment: 'positive' }} />);

    const badge = screen.getByText('Positiva');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('aria-label', 'Sentimento: Positiva');
  });

  it('deve exibir badge cinza para sentimento neutro', () => {
    render(<ReviewCard review={{ ...baseReview, sentiment: 'neutral' }} />);

    expect(screen.getByText('Neutra')).toBeInTheDocument();
  });

  it('deve exibir badge vermelho para sentimento negativo', () => {
    render(<ReviewCard review={{ ...baseReview, sentiment: 'negative' }} />);

    expect(screen.getByText('Negativa')).toBeInTheDocument();
  });

  it('não deve exibir badge quando sentimento é null', () => {
    render(<ReviewCard review={baseReview} />);

    expect(screen.queryByText('Positiva')).not.toBeInTheDocument();
    expect(screen.queryByText('Neutra')).not.toBeInTheDocument();
    expect(screen.queryByText('Negativa')).not.toBeInTheDocument();
  });

  it('deve exibir "Anônimo" quando userName não está presente', () => {
    render(<ReviewCard review={{ ...baseReview, userName: undefined }} />);

    expect(screen.getByText('Anônimo')).toBeInTheDocument();
  });
});
