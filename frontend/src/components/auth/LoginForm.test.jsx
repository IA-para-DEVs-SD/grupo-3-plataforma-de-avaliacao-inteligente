import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from './LoginForm.jsx';

// Mock do hook useAuth
const mockLogin = vi.fn();
vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

// Mock do useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

// Renderiza o componente com MemoryRouter para suporte ao Link
function renderForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar todos os campos e o botão de login', () => {
    renderForm();

    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByText('Não tem conta?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cadastre-se' })).toHaveAttribute('href', '/register');
  });

  it('deve exibir erro de validação no campo e-mail ao perder foco com formato inválido', async () => {
    const user = userEvent.setup();
    renderForm();

    const emailInput = screen.getByLabelText('E-mail');
    await user.type(emailInput, 'email-invalido');
    await user.tab();

    expect(screen.getByText('Formato de e-mail inválido')).toBeInTheDocument();
  });

  it('deve exibir erro de validação no campo senha ao perder foco com menos de 8 caracteres', async () => {
    const user = userEvent.setup();
    renderForm();

    const passwordInput = screen.getByLabelText('Senha');
    await user.type(passwordInput, '1234567');
    await user.tab();

    expect(screen.getByText('A senha deve ter no mínimo 8 caracteres')).toBeInTheDocument();
  });

  it('deve exibir todos os erros de validação ao submeter formulário vazio', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(screen.getByText('O e-mail é obrigatório')).toBeInTheDocument();
    expect(screen.getByText('A senha é obrigatória')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('deve chamar login e navegar para "/" após login com sucesso', async () => {
    mockLogin.mockResolvedValueOnce({ token: 'abc', user: { id: '1' } });
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('E-mail'), 'joao@email.com');
    await user.type(screen.getByLabelText('Senha'), 'senha1234');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('joao@email.com', 'senha1234');
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('deve exibir mensagem genérica de erro quando o login falha (Requisito 1.3)', async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { error: { message: 'Credenciais inválidas' } } },
    });
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('E-mail'), 'joao@email.com');
    await user.type(screen.getByLabelText('Senha'), 'senhaerrada');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(screen.getByText('E-mail ou senha incorretos')).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('deve exibir estado de carregamento no botão durante o envio', async () => {
    // Simula uma chamada que demora para resolver
    let resolveLogin;
    mockLogin.mockImplementation(() => new Promise((resolve) => { resolveLogin = resolve; }));
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('E-mail'), 'ana@email.com');
    await user.type(screen.getByLabelText('Senha'), 'senha1234');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled();

    // Resolve a promise para limpar o estado
    await waitFor(() => resolveLogin({ token: 'x', user: { id: '1' } }));
  });

  it('deve ter atributos de acessibilidade nos campos', () => {
    renderForm();

    expect(screen.getByLabelText('E-mail')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByLabelText('Senha')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByRole('form')).toHaveAttribute('aria-label', 'Formulário de login');
  });
});
