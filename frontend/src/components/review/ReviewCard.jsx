/**
 * Card de avaliação individual.
 * Exibe texto, nota (estrelas), autor, data e badge de sentimento.
 */
export default function ReviewCard({ review }) {
  const { text, rating, userName, createdAt, sentiment } = review;

  const stars = Array.from({ length: 5 }, (_, i) => (i < rating ? '★' : '☆')).join('');

  const formattedDate = new Date(createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <article style={styles.card} aria-label={`Avaliação de ${userName || 'Anônimo'}`}>
      <div style={styles.header}>
        <div style={styles.authorRow}>
          <strong style={styles.author}>{userName || 'Anônimo'}</strong>
          {sentiment && (
            <span
              style={{ ...styles.badge, ...badgeColors[sentiment] }}
              aria-label={`Sentimento: ${sentimentLabels[sentiment]}`}
            >
              {sentimentLabels[sentiment]}
            </span>
          )}
        </div>
        <time style={styles.date} dateTime={createdAt}>{formattedDate}</time>
      </div>
      <div style={styles.stars} aria-label={`Nota: ${rating} de 5`}>{stars}</div>
      <p style={styles.text}>{text}</p>
    </article>
  );
}

const sentimentLabels = { positive: 'Positiva', neutral: 'Neutra', negative: 'Negativa' };

const badgeColors = {
  positive: { backgroundColor: 'var(--color-bg-badge-positive)', color: 'var(--color-text-positive)' },
  neutral:  { backgroundColor: 'var(--color-bg-badge-neutral)',  color: 'var(--color-text-neutral)'  },
  negative: { backgroundColor: 'var(--color-bg-badge-negative)', color: 'var(--color-text-negative)' },
};

const styles = {
  card: {
    padding: '1rem',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    backgroundColor: 'var(--color-bg-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  authorRow: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  author: { fontSize: '0.95rem', color: 'var(--color-text)' },
  badge: { fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 500 },
  date: { fontSize: '0.8rem', color: 'var(--color-text-faint)' },
  stars: { fontSize: '1.1rem', color: 'var(--color-star)', letterSpacing: '2px' },
  text: { margin: 0, lineHeight: 1.5, color: 'var(--color-text)' },
};
