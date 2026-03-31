/**
 * Card de avaliação individual.
 * Exibe texto, nota (estrelas), autor, data e badge de sentimento.
 * Badge: positivo=verde, neutro=cinza, negativo=vermelho, null=sem badge.
 * @param {object} props
 * @param {{ text: string, rating: number, userName: string, createdAt: string, sentiment: 'positive' | 'neutral' | 'negative' | null }} props.review — dados da avaliação
 * @returns {JSX.Element}
 */
export default function ReviewCard({ review }) {
  const { text, rating, userName, createdAt, sentiment } = review;

  // Gera representação visual de estrelas (★ preenchida, ☆ vazia)
  const stars = Array.from({ length: 5 }, (_, i) => (i < rating ? '★' : '☆')).join('');

  // Formata data para pt-BR
  const formattedDate = new Date(createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
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

      <div style={styles.stars} aria-label={`Nota: ${rating} de 5`}>
        {stars}
      </div>

      <p style={styles.text}>{text}</p>
    </article>
  );
}

// Mapeamento de sentimento para rótulos em português
const sentimentLabels = {
  positive: 'Positiva',
  neutral: 'Neutra',
  negative: 'Negativa',
};

// Cores dos badges por sentimento
const badgeColors = {
  positive: { backgroundColor: '#e8f5e9', color: '#2e7d32' },
  neutral: { backgroundColor: '#f5f5f5', color: '#616161' },
  negative: { backgroundColor: '#fdecea', color: '#c62828' },
};

/* Estilos inline para o POC */
const styles = {
  card: {
    padding: '1rem',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  author: {
    fontSize: '0.95rem',
  },
  badge: {
    fontSize: '0.75rem',
    padding: '2px 8px',
    borderRadius: '12px',
    fontWeight: 500,
  },
  date: {
    fontSize: '0.8rem',
    color: '#888',
  },
  stars: {
    fontSize: '1.1rem',
    color: '#f9a825',
    letterSpacing: '2px',
  },
  text: {
    margin: 0,
    lineHeight: 1.5,
    color: '#333',
  },
};
