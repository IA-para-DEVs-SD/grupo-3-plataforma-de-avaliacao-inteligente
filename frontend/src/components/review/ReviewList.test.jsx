import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewList from './ReviewList.jsx';

// Mock do ReviewCard para simplificar testes da lista
vi.mock('./ReviewCard.jsx', () => ({
  default: ({ review }) => <div data-testid={`review-${review.id}`}>{review.text}</div>,
}));

describe('ReviewList — lista paginada de avaliações', () => {
  const mockReviews = [
    { id: '1', text: 'Avaliação 1', rating: 5, userName: 'User 1', createdAt: '2024-01-01', sentiment: null },
    { id: '2', text: 'Avaliação 2', rating: 3, userName: 'User 2', createdAt: '2024-01-02', sentiment: 'positive' },
  ];

  it('deve exibir mensagem de loading', () => {
    render(<ReviewList reviews={[]} page={1} totalPages={0} loading={true} onPageChange={() => {}} />);

    expect(screen.getByText('Carregando avaliações...')).toBeInTheDocument();
  });

  it('deve exibir mensagem quando lista está vazia', () => {
    render(<ReviewList reviews={[]} page={1} totalPages={0} loading={false} onPageChange={() => {}} />);

    expect(screen.getByText('Nenhuma avaliação encontrada.')).toBeInTheDocument();
  });

  it('deve renderizar ReviewCards para cada avaliação', () => {
    render(<ReviewList reviews={mockReviews} page={1} totalPages={1} loading={false} onPageChange={() => {}} />);

    expect(screen.getByTestId('review-1')).toBeInTheDocument();
    expect(screen.getByTestId('review-2')).toBeInTheDocument();
  });

  it('deve exibir controles de paginação quando há mais de uma página', () => {
    render(<ReviewList reviews={mockReviews} page={1} totalPages={3} loading={false} onPageChange={() => {}} />);

    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Página anterior')).toBeDisabled();
    expect(screen.getByLabelText('Próxima página')).not.toBeDisabled();
  });

  it('deve chamar onPageChange ao clicar em Próxima', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<ReviewList reviews={mockReviews} page={1} totalPages={3} loading={false} onPageChange={onPageChange} />);

    await user.click(screen.getByLabelText('Próxima página'));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('não deve exibir paginação quando há apenas uma página', () => {
    render(<ReviewList reviews={mockReviews} page={1} totalPages={1} loading={false} onPageChange={() => {}} />);

    expect(screen.queryByText('Página 1 de 1')).not.toBeInTheDocument();
  });
});
