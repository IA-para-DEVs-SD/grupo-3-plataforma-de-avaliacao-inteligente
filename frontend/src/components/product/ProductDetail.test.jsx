import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductDetail from './ProductDetail.jsx';

// Mock do hook useProducts
const mockGetProduct = vi.fn();
let mockProductState = { loading: false, error: null };

vi.mock('../../hooks/useProducts.js', () => ({
  useProducts: () => ({ ...mockProductState, getProduct: mockGetProduct }),
}));

// Mock do hook useInsights
const mockFetchInsights = vi.fn();
let mockInsightsState = { insights: null, loading: false, error: null };

vi.mock('../../hooks/useInsights.js', () => ({
  useInsights: () => ({ ...mockInsightsState, fetchInsights: mockFetchInsights }),
}));

// Mock do hook useReviews
const mockFetchReviews = vi.fn();
const mockSubmitReview = vi.fn();
const mockSetFilter = vi.fn();
const mockSetPage = vi.fn();
let mockReviewsState = {
  reviews: [], page: 1, totalPages: 0, loading: false, error: null,
  filters: { sentiment: '', sort: '', pattern: '' },
};

vi.mock('../../hooks/useReviews.js', () => ({
  useReviews: () => ({
    ...mockReviewsState,
    fetchReviews: mockFetchReviews,
    submitReview: mockSubmitReview,
    setFilter: mockSetFilter,
    setPage: mockSetPage,
  }),
}));

// Mock do hook useAuth (usado pelo ReviewForm)
vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => ({ user: null, isAuthenticated: false, logout: vi.fn() }),
}));

/** Renderiza ProductDetail com rota parametrizada */
function renderDetail(productId = '42') {
  return render(
    <MemoryRouter initialEntries={[`/products/${productId}`]}>
      <Routes>
        <Route path="/products/:id" element={<ProductDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProductDetail', () => {
  const mockProduct = {
    id: '42',
    name: 'Monitor Ultrawide',
    description: 'Monitor curvo de 34 polegadas com resolução WQHD.',
    category: 'Monitores',
    imageUrl: 'https://example.com/monitor.jpg',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockProductState = { loading: false, error: null };
    mockInsightsState = { insights: null, loading: false, error: null };
    mockReviewsState = {
      reviews: [], page: 1, totalPages: 0, loading: false, error: null,
      filters: { sentiment: '', sort: '', pattern: '' },
    };
    mockGetProduct.mockResolvedValue(mockProduct);
  });

  it('deve chamar getProduct, fetchInsights e fetchReviews com o ID da URL', async () => {
    renderDetail('42');

    await waitFor(() => {
      expect(mockGetProduct).toHaveBeenCalledWith('42');
    });
    expect(mockFetchInsights).toHaveBeenCalledWith('42');
    expect(mockFetchReviews).toHaveBeenCalledWith('42');
  });

  it('deve exibir todos os campos do produto após carregamento', async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText('Monitor Ultrawide')).toBeInTheDocument();
    });

    expect(screen.getByText('Monitores')).toBeInTheDocument();
    expect(screen.getByText(/monitor curvo de 34 polegadas/i)).toBeInTheDocument();

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/monitor.jpg');
    expect(img).toHaveAttribute('alt', 'Monitor Ultrawide');
  });

  it('deve exibir mensagem de carregamento quando loading é true', () => {
    mockProductState = { loading: true, error: null };
    mockGetProduct.mockReturnValue(new Promise(() => {}));
    renderDetail();

    expect(screen.getByText('Carregando produto...')).toBeInTheDocument();
  });

  it('deve exibir mensagem de erro amigável quando há erro de produto', () => {
    mockProductState = { loading: false, error: 'Erro de rede' };
    mockGetProduct.mockResolvedValue(null);
    renderDetail();

    expect(screen.getByText(/não foi possível carregar o produto/i)).toBeInTheDocument();
  });

  it('deve exibir "Produto não encontrado." quando getProduct retorna null', async () => {
    mockGetProduct.mockResolvedValue(null);
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText('Produto não encontrado.')).toBeInTheDocument();
    });
  });

  it('deve exibir mensagem de carregamento de insights', async () => {
    mockInsightsState = { insights: null, loading: true, error: null };
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText('Monitor Ultrawide')).toBeInTheDocument();
    });

    expect(screen.getByText('Carregando insights...')).toBeInTheDocument();
  });

  it('deve exibir erro amigável quando insights falham', async () => {
    mockInsightsState = { insights: null, loading: false, error: 'Falha' };
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText('Monitor Ultrawide')).toBeInTheDocument();
    });

    expect(screen.getByText(/não foi possível carregar os insights/i)).toBeInTheDocument();
  });

  it('deve usar imagem placeholder quando imageUrl está ausente', async () => {
    mockGetProduct.mockResolvedValue({ ...mockProduct, imageUrl: '' });
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText('Monitor Ultrawide')).toBeInTheDocument();
    });

    const img = screen.getByRole('img');
    expect(img.src).toContain('placeholder');
    expect(img).toHaveAttribute('alt', 'Imagem indisponível');
  });

  it('deve ter aria-label acessível no artigo', async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByLabelText('Detalhes de Monitor Ultrawide')).toBeInTheDocument();
    });
  });
});
