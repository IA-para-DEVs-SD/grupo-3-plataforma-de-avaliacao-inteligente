/**
 * Card de resumo automático de avaliações (pontos positivos e negativos gerados pela IA).
 */
export default function InsightCard({ summary }) {
  if (!summary || (!summary.positives?.length && !summary.negatives?.length)) {
    return (
      <section style={styles.container} aria-label="Resumo de avaliações">
        <h3 style={styles.title}>Resumo das Avaliações</h3>
        <p style={styles.placeholder} role="status">Resumo disponível após 5 avaliações</p>
      </section>
    );
  }

  return (
    <section style={styles.container} aria-label="Resumo de avaliações">
      <h3 style={styles.title}>Resumo das Avaliações</h3>
      <div style={styles.columns}>
        {summary.positives?.length > 0 && (
          <div style={styles.column}>
            <h4 style={{ ...styles.heading, color: 'var(--color-text-positive)' }}>👍 Pontos Positivos</h4>
            <ul style={styles.list} aria-label="Pontos positivos">
              {summary.positives.map((point, i) => <li key={i} style={styles.item}>{point}</li>)}
            </ul>
          </div>
        )}
        {summary.negatives?.length > 0 && (
          <div style={styles.column}>
            <h4 style={{ ...styles.heading, color: 'var(--color-text-negative)' }}>👎 Pontos Negativos</h4>
            <ul style={styles.list} aria-label="Pontos negativos">
              {summary.negatives.map((point, i) => <li key={i} style={styles.item}>{point}</li>)}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

const styles = {
  container: { padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-bg-card)' },
  title: { margin: '0 0 0.75rem 0', fontSize: '1.1rem', color: 'var(--color-text)' },
  placeholder: { color: 'var(--color-text-faint)', fontStyle: 'italic', margin: 0, padding: '0.5rem 0' },
  columns: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap' },
  column: { flex: '1 1 200px', minWidth: 0 },
  heading: { margin: '0 0 0.5rem 0', fontSize: '0.95rem' },
  list: { margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  item: { fontSize: '0.9rem', color: 'var(--color-text)', lineHeight: 1.4 },
};
