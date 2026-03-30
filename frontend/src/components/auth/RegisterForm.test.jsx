import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RegisterForm from './RegisterForm.jsx';

// Mock do hook useAuth
const mockRegister = vi.fn();
vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => ({ register: mockRegister }),
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
      <RegisterForm />
    </MemoryRouter>
  );
}

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar todos os campos e o botão de cadastro', () => {
    renderForm();

    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeInTheDocument();
    expect(screen.getByText('Já tem conta?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Faça login' })).toHaveAttribute('href', '/login');
  });

  it('deve exibir erro de validação no campo nome ao perder foco com valor vazio', async () => {
    const user = userEvent.setup();
    renderForm();

    const nameInput = screen.getByLabelText('Nome');
    await user.click(nameInput);
    await user.tab();

    expect(screen.getByText('O nome é obrigatório')).toBeInTheDocument();
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

    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(screen.getByText('O nome é obrigatório')).toBeInTheDocument();
    expect(screen.getByText('O e-mail é obrigatório')).toBeInTheDocument();
    expect(screen.getByText('A senha é obrigatória')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('deve chamar register e navegar para "/" após cadastro com sucesso', async () => {
    mockRegister.mockResolvedValueOnce({ token: 'abc', user: { id: '1' } });
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Nome'), 'João Silva');
    await user.type(screen.getByLabelText('E-mail'), 'joao@email.com');
    await user.type(screen.getByLabelText('Senha'), 'senha1234');
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('João Silva', 'joao@email.com', 'senha1234');
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('deve exibir mensagem de erro da API quando o cadastro falha', async () => {
    mockRegister.mockRejectedValueOnce({
      response: { data: { error: { message: 'E-mail já está em uso' } } },
    });
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Nome'), 'Maria');
    await user.type(screen.getByLabelText('E-mail'), 'maria@email.com');
    await user.type(screen.getByLabelText('Senha'), 'senha1234');
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => {
      expect(screen.getByText('E-mail já está em uso')).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('deve exibir estado de carregamento no botão durante o envio', async () => {
    // Simula uma chamada que demora para resolver
    let resolveRegister;
    mockRegister.mockImplementation(() => new Promise((resolve) => { resolveRegister = resolve; }));
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Nome'), 'Ana');
    await user.type(screen.getByLabelText('E-mail'), 'ana@email.com');
    await user.type(screen.getByLabelText('Senha'), 'senha1234');
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(screen.getByRole('button', { name: 'Cadastrando...' })).toBeDisabled();

    // Resolve a promise para limpar o estado
    await waitFor(() => resolveRegister({ token: 'x', user: { id: '1' } }));
  });

  it('deve ter atributos de acessibilidade nos campos', () => {
    renderForm();

    expect(screen.getByLabelText('Nome')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByLabelText('Senha')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByRole('form')).toHaveAttribute('aria-label', 'Formulário de cadastro');
  });
});
