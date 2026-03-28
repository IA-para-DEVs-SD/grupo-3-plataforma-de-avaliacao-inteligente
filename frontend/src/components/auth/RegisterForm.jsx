import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { validateName, validateEmail, validatePassword } from '../../utils/validators.js';

/**
 * Formulário de cadastro de novo usuário.
 * Valida campos inline (on blur e on submit) e redireciona para a página inicial após sucesso.
 */
export default function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Estado dos campos do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Estado dos erros de validação inline
  const [errors, setErrors] = useState({ name: null, email: null, password: null });

  // Estado de erro retornado pela API (ex: e-mail já cadastrado)
  const [apiError, setApiError] = useState(null);

  // Estado de carregamento durante o envio
  const [loading, setLoading] = useState(false);

  /**
   * Valida um campo individual e atualiza o estado de erros.
   * Chamado no evento onBlur de cada input.
   */
  function handleBlur(field) {
    const validators = {
      name: () => validateName(name),
      email: () => validateEmail(email),
      password: () => validatePassword(password),
    };

    setErrors((prev) => ({ ...prev, [field]: validators[field]() }));
  }

  /**
   * Valida todos os campos e retorna true se o formulário é válido.
   */
  function validateAll() {
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({ name: nameError, email: emailError, password: passwordError });

    return !nameError && !emailError && !passwordError;
  }

  /**
   * Envia os dados de cadastro para a API.
   * Exibe erros de validação ou da API conforme necessário.
   */
  async function handleSubmit(event) {
    event.preventDefault();
    setApiError(null);

    if (!validateAll()) return;

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/');
    } catch (error) {
      // Extrai mensagem de erro da resposta da API
      const message =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        'Erro ao criar conta. Tente novamente.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Formulário de cadastro">
      <h2>Criar Conta</h2>

      {/* Mensagem de erro da API */}
      {apiError && (
        <div role="alert" style={styles.apiError}>
          {apiError}
        </div>
      )}

      {/* Campo Nome */}
      <div style={styles.field}>
        <label htmlFor="register-name">Nome</label>
        <input
          id="register-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => handleBlur('name')}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'register-name-error' : undefined}
          disabled={loading}
        />
        {errors.name && (
          <span id="register-name-error" role="alert" style={styles.error}>
            {errors.name}
          </span>
        )}
      </div>

      {/* Campo E-mail */}
      <div style={styles.field}>
        <label htmlFor="register-email">E-mail</label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur('email')}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'register-email-error' : undefined}
          disabled={loading}
        />
        {errors.email && (
          <span id="register-email-error" role="alert" style={styles.error}>
            {errors.email}
          </span>
        )}
      </div>

      {/* Campo Senha */}
      <div style={styles.field}>
        <label htmlFor="register-password">Senha</label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => handleBlur('password')}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'register-password-error' : undefined}
          disabled={loading}
        />
        {errors.password && (
          <span id="register-password-error" role="alert" style={styles.error}>
            {errors.password}
          </span>
        )}
      </div>

      {/* Botão de envio */}
      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? 'Cadastrando...' : 'Cadastrar'}
      </button>

      {/* Link para login */}
      <p style={styles.link}>
        Já tem conta? <Link to="/login">Faça login</Link>
      </p>
    </form>
  );
}

// Estilos inline simples para o POC
const styles = {
  field: {
    marginBottom: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  error: {
    color: '#d32f2f',
    fontSize: '0.85rem',
  },
  apiError: {
    color: '#d32f2f',
    backgroundColor: '#fdecea',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  button: {
    marginTop: '0.5rem',
    padding: '0.6rem 1.2rem',
    cursor: 'pointer',
  },
  link: {
    marginTop: '1rem',
    fontSize: '0.9rem',
  },
};
