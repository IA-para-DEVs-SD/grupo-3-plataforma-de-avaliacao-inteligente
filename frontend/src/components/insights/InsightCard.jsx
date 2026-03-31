/**
 * Card de resumo automático de avaliações.
 * Exibe listas de pontos positivos e negativos gerados pela IA.
 * Se o resumo não estiver disponível, exibe mensagem informativa.
 * @param {{ summary: { positives: string[], negatives: string[] } | null }} props
 * @param {{ positives: string[], negatives: string[] } | null} props.summary — resumo gerado pela IA, null se abaixo do threshold de 5 avaliações
 */
export default function InsightCard({ summary }) {
  // Resumo indisponível — exibe mensagem de threshold
  if (!summary || (!summary.positives?.length && !summary.negatives?.length)) {
    return (
      <section style={styles.container} aria-label="Resumo de avaliações">
        <h3 style={styles.title}>Resumo das Avaliações</h3>
        <p style={styles.placeholder} role="status">
          Resumo disponível após 5 avaliações
        </p>
      </section>
    );
  }

  return (
    <section style={styles.container} aria-label="Resumo de avaliações">
      <h3 style={styles.title}>Resumo das Avaliações</h3>
      <div style={styles.columns}>
        {/* Pontos positivos */}
        {summary.positives?.length > 0 && (
          <div style={styles.column}>
            <h4 style={styles.positiveHeading}>👍 Pontos Positivos</h4>
            <ul style={styles.list} aria-label="Pontos positivos">
              {summary.positives.map((point, index) => (
                <li key={index} style={styles.positiveItem}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Pontos negativos */}
        {summary.negatives?.length > 0 && (
          <div style={styles.column}>
            <h4 style={styles.negativeHeading}>👎 Pontos Negativos</h4>
            <ul style={styles.list} aria-label="Pontos negativos">
              {summary.negatives.map((point, index) => (
                <li key={index} style={styles.negativeItem}>{point}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

/* Estilos inline para o POC */
const styles = {
  container: {
    padding: '1rem',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
  },
  title: {
    margin: '0 0 0.75rem 0',
    fontSize: '1.1rem',
    color: '#333',
  },
  placeholder: {
    color: '#888',
    fontStyle: 'italic',
    margin: 0,
    padding: '0.5rem 0',
  },
  columns: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  column: {
    flex: '1 1 200px',
    minWidth: 0,
  },
  positiveHeading: {
    margin: '0 0 0.5rem 0',
    fontSize: '0.95rem',
    color: '#2e7d32',
  },
  negativeHeading: {
    margin: '0 0 0.5rem 0',
    fontSize: '0.95rem',
    color: '#c62828',
  },
  list: {
    margin: 0,
    paddingLeft: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  positiveItem: {
    fontSize: '0.9rem',
    color: '#333',
    lineHeight: 1.4,
  },
  negativeItem: {
    fontSize: '0.9rem',
    color: '#333',
    lineHeight: 1.4,
  },
};
