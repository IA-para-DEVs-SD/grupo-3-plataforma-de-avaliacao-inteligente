import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ProductSearch from './ProductSearch.jsx';

// Mock do hook useProducts
const mockSearch = vi.fn();
let mockState = { products: [], loading: false, error: null };

vi.mock('../../hooks/useProducts.js', () => ({
  useProducts: () => ({ ...mockState, search: mockSearch }),
}));

function renderSearch() {
  return render(
    <MemoryRouter>
      <ProductSearch />
    </MemoryRouter>
  );
}

describe('ProductSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = { products: [], loading: false, error: null };
  });

  it('deve renderizar campo de busca e botão', () => {
    renderSearch();

    expect(screen.getByPlaceholderText(/buscar por nome ou categoria/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument();
  });

  it('deve chamar search ao submeter o formulário com termo válido', async () => {
    const user = userEvent.setup();
    renderSearch();

    await user.type(screen.getByPlaceholderText(/buscar/i), 'Teclado');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(mockSearch).toHaveBeenCalledWith('Teclado');
  });

  it('não deve chamar search quando o campo está vazio', async () => {
    const user = userEvent.setup();
    renderSearch();

    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(mockSearch).not.toHaveBeenCalled();
  });

  it('não deve chamar search quando o campo contém apenas espaços', async () => {
    const user = userEvent.setup();
    renderSearch();

    await user.type(screen.getByPlaceholderText(/buscar/i), '   ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(mockSearch).not.toHaveBeenCalled();
  });

  it('deve exibir mensagem de carregamento quando loading é true', () => {
    mockState = { products: [], loading: true, error: null };
    renderSearch();

    expect(screen.getByText('Carregando resultados...')).toBeInTheDocument();
  });

  it('deve exibir mensagem de erro quando há erro', () => {
    mockState = { products: [], loading: false, error: 'Erro de rede' };
    renderSearch();

    expect(screen.getByText('Erro de rede')).toBeInTheDocument();
  });

  it('deve exibir lista de produtos quando há resultados', () => {
    mockState = {
      products: [
        { id: '1', name: 'Teclado', category: 'Periféricos', imageUrl: '' },
        { id: '2', name: 'Mouse', category: 'Periféricos', imageUrl: '' },
      ],
      loading: false,
      error: null,
    };
    renderSearch();

    expect(screen.getByText('Teclado')).toBeInTheDocument();
    expect(screen.getByText('Mouse')).toBeInTheDocument();
  });

  it('deve exibir "Nenhum resultado encontrado" após busca sem resultados (Task 4.1.6)', async () => {
    const user = userEvent.setup();
    renderSearch();

    // Digita e submete para ativar hasSearched
    await user.type(screen.getByPlaceholderText(/buscar/i), 'xyz');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    // Após a busca, o estado continua com products vazio
    await waitFor(() => {
      expect(screen.getByText('Nenhum resultado encontrado')).toBeInTheDocument();
    });
  });

  it('não deve exibir "Nenhum resultado encontrado" antes de realizar uma busca', () => {
    renderSearch();

    expect(screen.queryByText('Nenhum resultado encontrado')).not.toBeInTheDocument();
  });

  it('deve desabilitar input e botão durante carregamento', () => {
    mockState = { products: [], loading: true, error: null };
    renderSearch();

    expect(screen.getByPlaceholderText(/buscar/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buscando...' })).toBeDisabled();
  });

  it('deve ter role="search" no formulário', () => {
    renderSearch();

    expect(screen.getByRole('search')).toBeInTheDocument();
  });
});
