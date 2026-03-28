import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { validateEmail, validatePassword } from '../../utils/validators.js';

/**
 * Formulário de login do usuário.
 * Valida campos inline (on blur e on submit) e redireciona para a página inicial após sucesso.
 * Mensagem de erro genérica para credenciais inválidas — não revela qual campo está errado (Requisito 1.3).
 */
export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Estado dos campos do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Estado dos erros de validação inline
  const [errors, setErrors] = useState({ email: null, password: null });

  // Estado de erro retornado pela API (mensagem genérica de credenciais incorretas)
  const [apiError, setApiError] = useState(null);

  // Estado de carregamento durante o envio
  const [loading, setLoading] = useState(false);

  /**
   * Valida um campo individual e atualiza o estado de erros.
   * Chamado no evento onBlur de cada input.
   */
  function handleBlur(field) {
    const validators = {
      email: () => validateEmail(email),
      password: () => validatePassword(password),
    };

    setErrors((prev) => ({ ...prev, [field]: validators[field]() }));
  }

  /**
   * Valida todos os campos e retorna true se o formulário é válido.
   */
  function validateAll() {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({ email: emailError, password: passwordError });

    return !emailError && !passwordError;
  }

  /**
   * Envia as credenciais de login para a API.
   * Exibe mensagem genérica em caso de falha — sem revelar qual campo está errado.
   */
  async function handleSubmit(event) {
    event.preventDefault();
    setApiError(null);

    if (!validateAll()) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch {
      // Mensagem genérica — não revela se o e-mail ou a senha está incorreta (Requisito 1.3)
      setApiError('E-mail ou senha incorretos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Formulário de login">
      <h2>Entrar</h2>

      {/* Mensagem de erro da API */}
      {apiError && (
        <div role="alert" style={styles.apiError}>
          {apiError}
        </div>
      )}

      {/* Campo E-mail */}
      <div style={styles.field}>
        <label htmlFor="login-email">E-mail</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur('email')}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'login-email-error' : undefined}
          disabled={loading}
        />
        {errors.email && (
          <span id="login-email-error" role="alert" style={styles.error}>
            {errors.email}
          </span>
        )}
      </div>

      {/* Campo Senha */}
      <div style={styles.field}>
        <label htmlFor="login-password">Senha</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => handleBlur('password')}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'login-password-error' : undefined}
          disabled={loading}
        />
        {errors.password && (
          <span id="login-password-error" role="alert" style={styles.error}>
            {errors.password}
          </span>
        )}
      </div>

      {/* Botão de envio */}
      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>

      {/* Link para cadastro */}
      <p style={styles.link}>
        Não tem conta? <Link to="/register">Cadastre-se</Link>
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
