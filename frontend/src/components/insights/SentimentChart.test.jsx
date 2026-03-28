import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SentimentChart from './SentimentChart.jsx';

describe('SentimentChart', () => {
  const distribution = { positive: 60.5, neutral: 25.3, negative: 14.2 };

  it('deve exibir as três barras com percentuais', () => {
    render(<SentimentChart distribution={distribution} />);

    expect(screen.getByText('Positivas')).toBeInTheDocument();
    expect(screen.getByText('Neutras')).toBeInTheDocument();
    expect(screen.getByText('Negativas')).toBeInTheDocument();
    expect(screen.getByText('60.5%')).toBeInTheDocument();
    expect(screen.getByText('25.3%')).toBeInTheDocument();
    expect(screen.getByText('14.2%')).toBeInTheDocument();
  });

  it('deve ter aria-label acessível na seção', () => {
    render(<SentimentChart distribution={distribution} />);

    expect(screen.getByLabelText('Distribuição de sentimento')).toBeInTheDocument();
  });

  it('deve ter progressbars com aria-valuenow correto', () => {
    render(<SentimentChart distribution={distribution} />);

    const bars = screen.getAllByRole('progressbar');
    expect(bars).toHaveLength(3);
    expect(bars[0]).toHaveAttribute('aria-valuenow', '60.5');
    expect(bars[1]).toHaveAttribute('aria-valuenow', '25.3');
    expect(bars[2]).toHaveAttribute('aria-valuenow', '14.2');
  });

  it('não deve renderizar nada quando distribution é null', () => {
    const { container } = render(<SentimentChart distribution={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('deve lidar com valores zero', () => {
    render(<SentimentChart distribution={{ positive: 0, neutral: 0, negative: 0 }} />);

    // Todas as três barras exibem 0.0%
    const zeroLabels = screen.getAllByText('0.0%');
    expect(zeroLabels).toHaveLength(3);
  });
});
