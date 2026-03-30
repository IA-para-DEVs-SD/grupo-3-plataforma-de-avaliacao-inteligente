import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ReviewForm from './ReviewForm.jsx';

// Mock do hook useAuth para controlar estado de autenticação nos testes
const mockUseAuth = vi.fn();
vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => mockUseAuth(),
}));

// Wrapper com MemoryRouter para componentes que usam Link
function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('ReviewForm — formulário de avaliação', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('usuário não autenticado', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false });
    });

    it('deve exibir link para login quando não autenticado', () => {
      renderWithRouter(<ReviewForm onSubmit={() => {}} />);

      const link = screen.getByText('Faça login para avaliar');
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute('href', '/login');
    });

    it('não deve exibir o formulário quando não autenticado', () => {
      renderWithRouter(<ReviewForm onSubmit={() => {}} />);

      expect(screen.queryByLabelText('Sua avaliação')).not.toBeInTheDocument();
    });
  });

  describe('usuário autenticado', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ isAuthenticated: true });
    });

    it('deve exibir o formulário com campo de texto e estrelas', () => {
      renderWithRouter(<ReviewForm onSubmit={() => {}} />);

      expect(screen.getByText('Deixe sua avaliação')).toBeInTheDocument();
      expect(screen.getByLabelText('Sua avaliação')).toBeInTheDocument();
      expect(screen.getByLabelText('1 estrela')).toBeInTheDocument();
      expect(screen.getByLabelText('5 estrelas')).toBeInTheDocument();
    });

    it('deve exibir erro de validação quando texto é curto', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ReviewForm onSubmit={vi.fn()} />);

      await user.click(screen.getByLabelText('3 estrelas'));
      await user.type(screen.getByLabelText('Sua avaliação'), 'Texto curto');
      await user.click(screen.getByText('Enviar avaliação'));

      expect(screen.getByText('O texto da avaliação deve ter no mínimo 20 caracteres')).toBeInTheDocument();
    });

    it('deve exibir erro de validação quando nota não é selecionada', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ReviewForm onSubmit={vi.fn()} />);

      await user.type(screen.getByLabelText('Sua avaliação'), 'Este é um texto com mais de vinte caracteres para teste');
      await user.click(screen.getByText('Enviar avaliação'));

      expect(screen.getByText('A nota é obrigatória')).toBeInTheDocument();
    });

    it('deve chamar onSubmit com dados válidos e limpar formulário', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue({});
      renderWithRouter(<ReviewForm onSubmit={onSubmit} />);

      await user.click(screen.getByLabelText('4 estrelas'));
      await user.type(screen.getByLabelText('Sua avaliação'), 'Produto muito bom, recomendo para todos!');
      await user.click(screen.getByText('Enviar avaliação'));

      expect(onSubmit).toHaveBeenCalledWith({
        text: 'Produto muito bom, recomendo para todos!',
        rating: 4,
      });
    });

    it('deve exibir erro da API quando submissão falha', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockRejectedValue({
        response: { data: { error: { message: 'Erro no servidor' } } },
      });
      renderWithRouter(<ReviewForm onSubmit={onSubmit} />);

      await user.click(screen.getByLabelText('5 estrelas'));
      await user.type(screen.getByLabelText('Sua avaliação'), 'Produto excelente, superou expectativas!');
      await user.click(screen.getByText('Enviar avaliação'));

      expect(await screen.findByText('Erro no servidor')).toBeInTheDocument();
    });
  });
});
