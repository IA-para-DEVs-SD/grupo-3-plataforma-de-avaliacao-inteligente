import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { validateEmail, validatePassword } from '../../utils/validators.js';

/**
 * Formulário de login com validação inline, mostrar/ocultar senha e suporte a tema.
 */
export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: null, password: null });
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleBlur(field) {
    const validators = { email: () => validateEmail(email), password: () => validatePassword(password) };
    setErrors((prev) => ({ ...prev, [field]: validators[field]() }));
  }

  function validateAll() {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setErrors({ email: emailError, password: passwordError });
    return !emailError && !passwordError;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setApiError(null);
    if (!validateAll()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch {
      setApiError('E-mail ou senha incorretos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Formulário de login" style={styles.form}>
      <h2 style={styles.title}>Entrar</h2>

      {apiError && <div role="alert" style={styles.apiError}>{apiError}</div>}

      <div style={styles.field}>
        <label htmlFor="login-email" style={styles.label}>E-mail</label>
        <input
          id="login-email" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur('email')}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'login-email-error' : undefined}
          disabled={loading} style={styles.input}
        />
        {errors.email && <span id="login-email-error" role="alert" style={styles.error}>{errors.email}</span>}
      </div>

      <div style={styles.field}>
        <label htmlFor="login-password" style={styles.label}>Senha</label>
        <div style={styles.passwordWrapper}>
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => handleBlur('password')}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            disabled={loading}
            style={{ ...styles.input, paddingRight: '2.8rem' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            style={styles.eyeButton}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        {errors.password && <span id="login-password-error" role="alert" style={styles.error}>{errors.password}</span>}
      </div>

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>

      <p style={styles.link}>
        Não tem conta? <Link to="/register" style={styles.linkAnchor}>Cadastre-se</Link>
      </p>
    </form>
  );
}

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  title: { margin: '0 0 1rem 0', color: 'var(--color-text)' },
  field: { marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  label: { fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 500 },
  input: {
    padding: '0.6rem 0.75rem', fontSize: '1rem', width: '100%',
    border: '1px solid var(--color-border-input)', borderRadius: '6px',
    backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)',
    boxSizing: 'border-box',
  },
  passwordWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  eyeButton: {
    position: 'absolute', right: '0.5rem', background: 'none', border: 'none',
    cursor: 'pointer', fontSize: '1rem', padding: '0.2rem', lineHeight: 1,
  },
  error: { color: 'var(--color-error-text)', fontSize: '0.85rem' },
  apiError: {
    color: 'var(--color-error-text)', backgroundColor: 'var(--color-error-bg)',
    padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem',
  },
  button: {
    marginTop: '0.5rem', padding: '0.65rem 1.2rem', cursor: 'pointer',
    backgroundColor: 'var(--color-bg-header)', color: '#fff',
    border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 500,
  },
  link: { marginTop: '1rem', fontSize: '0.9rem', color: 'var(--color-text)' },
  linkAnchor: { color: 'var(--color-link)' },
};
