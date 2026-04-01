import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { validateReviewText, validateRating } from '../../utils/validators.js';

/** Mínimo de caracteres exigido para o texto da avaliação */
const MIN_TEXT_LENGTH = 20;

/**
 * Formulário de submissão de avaliação.
 * Inclui contador de caracteres em tempo real, seletor de estrelas,
 * validação inline e suporte a tema claro/escuro.
 */
export default function ReviewForm({ onSubmit, loading: externalLoading }) {
  const { isAuthenticated } = useAuth();
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isAuthenticated) {
    return (
      <div style={styles.authMessage} role="status">
        <p style={{ margin: 0 }}>
          <Link to="/login" style={styles.link}>Faça login para avaliar este produto</Link>
        </p>
      </div>
    );
  }

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
    setSuccess(false);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({ text, rating });
      setText('');
      setRating(0);
      setErrors({});
      setSuccess(true);
      // Remove mensagem de sucesso após 4 segundos
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setApiError(err.response?.data?.error?.message || err.message || 'Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = submitting || externalLoading;
  const charCount = text.length;
  const charOk = charCount >= MIN_TEXT_LENGTH;

  return (
    <form onSubmit={handleSubmit} style={styles.form} aria-label="Formulário de avaliação">
      <h3 style={styles.title}>Deixe sua avaliação</h3>

      {/* Feedback de sucesso */}
      {success && (
        <p role="status" style={styles.successMessage}>
          ✅ Avaliação enviada! A IA está analisando o sentimento em segundo plano.
        </p>
      )}

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
                color: (hoverRating || rating) >= star ? 'var(--color-star)' : 'var(--color-border)',
              }}>★</span>
            </button>
          ))}
        </div>
        {errors.rating && <span style={styles.error} role="alert">{errors.rating}</span>}
      </fieldset>

      {/* Campo de texto com contador */}
      <div style={styles.field}>
        <div style={styles.labelRow}>
          <label htmlFor="review-text" style={styles.label}>Sua avaliação</label>
          {/* Contador de caracteres em tempo real */}
          <span
            style={{
              ...styles.charCounter,
              color: charOk ? 'var(--color-text-positive)' : 'var(--color-text-negative)',
            }}
            aria-live="polite"
            aria-label={`${charCount} de ${MIN_TEXT_LENGTH} caracteres mínimos`}
          >
            {charCount}/{MIN_TEXT_LENGTH}
            {charOk && ' ✓'}
          </span>
        </div>
        <textarea
          id="review-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Descreva sua experiência com o produto..."
          style={styles.textarea}
          rows={4}
          disabled={isLoading}
          aria-describedby={errors.text ? 'review-text-error' : undefined}
        />
        {errors.text && <span id="review-text-error" style={styles.error} role="alert">{errors.text}</span>}
      </div>

      {apiError && <p style={styles.apiError} role="alert">{apiError}</p>}

      <button
        type="submit"
        disabled={isLoading}
        style={{ ...styles.submitButton, ...(isLoading ? styles.submitButtonDisabled : {}) }}
      >
        {isLoading ? 'Enviando...' : 'Enviar avaliação'}
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: 'flex', flexDirection: 'column', gap: '1rem',
    padding: '1.25rem', border: '1px solid var(--color-border)',
    borderRadius: '8px', backgroundColor: 'var(--color-bg-card)',
  },
  title: { margin: 0, fontSize: '1.1rem', color: 'var(--color-text)' },
  successMessage: {
    margin: 0, padding: '0.75rem', borderRadius: '6px',
    backgroundColor: 'var(--color-bg-badge-positive)',
    color: 'var(--color-text-positive)', fontSize: '0.9rem',
  },
  fieldset: { border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  legend: { fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500, marginBottom: '0.25rem' },
  starsRow: { display: 'flex', gap: '0.25rem' },
  starButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '2px' },
  star: { fontSize: '1.75rem', transition: 'color 0.15s' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 },
  charCounter: { fontSize: '0.8rem', fontWeight: 500, transition: 'color 0.2s' },
  textarea: {
    padding: '0.75rem', borderRadius: '6px',
    border: '1px solid var(--color-border-input)', fontSize: '0.9rem',
    resize: 'vertical', fontFamily: 'inherit',
    backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)',
  },
  error: { fontSize: '0.8rem', color: 'var(--color-error-text)' },
  apiError: {
    margin: 0, padding: '0.5rem 0.75rem',
    backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error-text)',
    borderRadius: '4px', fontSize: '0.85rem',
  },
  submitButton: {
    padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none',
    backgroundColor: 'var(--color-bg-header)', color: '#fff',
    fontSize: '0.95rem', cursor: 'pointer', fontWeight: 500, alignSelf: 'flex-start',
  },
  submitButtonDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  authMessage: {
    padding: '1.25rem', border: '1px solid var(--color-border)',
    borderRadius: '8px', backgroundColor: 'var(--color-bg-card)', textAlign: 'center',
  },
  link: { color: 'var(--color-link)', fontWeight: 500 },
};
