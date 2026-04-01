import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { validateName, validateEmail, validatePassword } from '../../utils/validators.js';

/**
 * Formulário de cadastro com validação inline, mostrar/ocultar senha e suporte a tema.
 */
export default function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ name: null, email: null, password: null });
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleBlur(field) {
    const validators = {
      name: () => validateName(name),
      email: () => validateEmail(email),
      password: () => validatePassword(password),
    };
    setErrors((prev) => ({ ...prev, [field]: validators[field]() }));
  }

  function validateAll() {
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setErrors({ name: nameError, email: emailError, password: passwordError });
    return !nameError && !emailError && !passwordError;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setApiError(null);
    if (!validateAll()) return;
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/');
    } catch (error) {
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
    <form onSubmit={handleSubmit} noValidate aria-label="Formulário de cadastro" style={styles.form}>
      <h2 style={styles.title}>Criar Conta</h2>

      {apiError && <div role="alert" style={styles.apiError}>{apiError}</div>}

      <div style={styles.field}>
        <label htmlFor="register-name" style={styles.label}>Nome</label>
        <input
          id="register-name" type="text" value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => handleBlur('name')}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'register-name-error' : undefined}
          disabled={loading} style={styles.input}
        />
        {errors.name && <span id="register-name-error" role="alert" style={styles.error}>{errors.name}</span>}
      </div>

      <div style={styles.field}>
        <label htmlFor="register-email" style={styles.label}>E-mail</label>
        <input
          id="register-email" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur('email')}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'register-email-error' : undefined}
          disabled={loading} style={styles.input}
        />
        {errors.email && <span id="register-email-error" role="alert" style={styles.error}>{errors.email}</span>}
      </div>

      <div style={styles.field}>
        <label htmlFor="register-password" style={styles.label}>Senha</label>
        <div style={styles.passwordWrapper}>
          <input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => handleBlur('password')}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'register-password-error' : undefined}
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
        {errors.password && <span id="register-password-error" role="alert" style={styles.error}>{errors.password}</span>}
      </div>

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? 'Cadastrando...' : 'Cadastrar'}
      </button>

      <p style={styles.link}>
        Já tem conta? <Link to="/login" style={styles.linkAnchor}>Faça login</Link>
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
