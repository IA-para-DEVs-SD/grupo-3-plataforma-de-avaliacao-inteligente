import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { validateReviewText, validateRating } from '../../utils/validators.js';

/**
 * Formulário de submissão de avaliação.
 * Inclui textarea para texto (mín. 20 chars), seletor de estrelas (1–5),
 * validação inline e redirecionamento para login se não autenticado.
 */
export default function ReviewForm({ onSubmit, loading: externalLoading }) {
  const { isAuthenticated } = useAuth();
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Usuário não autenticado — exibe mensagem com link para login
  if (!isAuthenticated) {
    return (
      <div style={styles.authMessage} role="alert">
        <p>
          <Link to="/login" style={styles.link}>Faça login para avaliar</Link>
        </p>
      </div>
    );
  }

  // Valida campos e retorna true se válido
  const validate = () => {
    const newErrors = {};
    const textError = validateReviewText(text);
    const ratingError = validateRating(rating || '');
    if (textError) newErrors.text = textError;
    if (ratingError) newErrors.rating = ratingError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({ text, rating });
      // Limpa formulário após sucesso
      setText('');
      setRating(0);
      setErrors({});
    } catch (err) {
      setApiError(err.response?.data?.error?.message || err.message || 'Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = submitting || externalLoading;

  return (
    <form onSubmit={handleSubmit} style={styles.form} aria-label="Formulário de avaliação">
      <h3 style={styles.title}>Deixe sua avaliação</h3>

      {/* Seletor de estrelas */}
      <fieldset style={styles.fieldset}>
        <legend style={styles.legend}>Nota</legend>
        <div style={styles.starsRow} role="radiogroup" aria-label="Selecione uma nota de 1 a 5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              style={styles.starButton}
              aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
              aria-pressed={rating === star}
            >
              <span style={{
                ...styles.star,
                color: (hoverRating || rating) >= star ? '#f9a825' : '#ccc',
              }}>
                ★
              </span>
            </button>
          ))}
        </div>
        {errors.rating && <span style={styles.error} role="alert">{errors.rating}</span>}
      </fieldset>

      {/* Campo de texto */}
      <div style={styles.field}>
        <label htmlFor="review-text" style={styles.label}>Sua avaliação</label>
        <textarea
          id="review-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Descreva sua experiência com o produto (mínimo 20 caracteres)"
          style={styles.textarea}
          rows={4}
          disabled={isLoading}
          aria-describedby={errors.text ? 'review-text-error' : undefined}
        />
        {errors.text && <span id="review-text-error" style={styles.error} role="alert">{errors.text}</span>}
      </div>

      {/* Erro da API */}
      {apiError && <p style={styles.apiError} role="alert">{apiError}</p>}

      <button
        type="submit"
        disabled={isLoading}
        style={{
          ...styles.submitButton,
          ...(isLoading ? styles.submitButtonDisabled : {}),
        }}
      >
        {isLoading ? 'Enviando...' : 'Enviar avaliação'}
      </button>
    </form>
  );
}

/* Estilos inline para o POC */
const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1.25rem',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
  },
  fieldset: {
    border: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  legend: {
    fontSize: '0.85rem',
    color: '#666',
    fontWeight: 500,
    marginBottom: '0.25rem',
  },
  starsRow: {
    display: 'flex',
    gap: '0.25rem',
  },
  starButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
  },
  star: {
    fontSize: '1.75rem',
    transition: 'color 0.15s',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  label: {
    fontSize: '0.85rem',
    color: '#666',
    fontWeight: 500,
  },
  textarea: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '0.9rem',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  error: {
    fontSize: '0.8rem',
    color: '#d32f2f',
  },
  apiError: {
    margin: 0,
    padding: '0.5rem 0.75rem',
    backgroundColor: '#fdecea',
    color: '#c62828',
    borderRadius: '4px',
    fontSize: '0.85rem',
  },
  submitButton: {
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#1976d2',
    color: '#fff',
    fontSize: '0.95rem',
    cursor: 'pointer',
    fontWeight: 500,
    alignSelf: 'flex-start',
  },
  submitButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  authMessage: {
    padding: '1.25rem',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
    textAlign: 'center',
  },
  link: {
    color: '#1976d2',
    fontWeight: 500,
  },
};
