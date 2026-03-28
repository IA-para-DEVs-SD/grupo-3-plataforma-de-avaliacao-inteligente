import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import PrivateRoute from './PrivateRoute.jsx';

// Mock do hook useAuth
vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../hooks/useAuth.js';

/**
 * Testes do componente PrivateRoute.
 * Valida proteção de rotas conforme Requisito 1.8:
 * - Redireciona para /login se não autenticado
 * - Renderiza conteúdo protegido se autenticado
 * - Exibe indicador de carregamento durante verificação
 */
describe('PrivateRoute', () => {
  it('exibe indicador de carregamento enquanto verifica autenticação', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: true });

    render(
      <MemoryRouter>
        <PrivateRoute>
          <div>Conteúdo protegido</div>
        </PrivateRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument();
  });

  it('redireciona para /login quando usuário não está autenticado', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false });

    render(
      <MemoryRouter initialEntries={['/protegida']}>
        <PrivateRoute>
          <div>Conteúdo protegido</div>
        </PrivateRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument();
  });

  it('renderiza conteúdo protegido quando usuário está autenticado', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false });

    render(
      <MemoryRouter>
        <PrivateRoute>
          <div>Conteúdo protegido</div>
        </PrivateRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument();
  });
});
