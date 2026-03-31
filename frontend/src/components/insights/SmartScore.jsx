/**
 * Componente de Score Inteligente.
 * Exibe o score inteligente (0–10, 1 casa decimal) e a média simples lado a lado.
 * Representação visual com estrelas (score/2 = estrelas preenchidas de 5).
 * Se smartScore é null, exibe mensagem de threshold.
 * @param {object} props
 * @param {number | null} props.smartScore — score inteligente ponderado (0–10) ou null se abaixo do threshold
 * @param {number | null} props.simpleAverage — média aritmética simples (1–5) ou null se sem avaliações
 * @returns {JSX.Element}
 */
export default function SmartScore({ smartScore, simpleAverage }) {
  /**
   * Gera representação visual de estrelas.
   * Converte score de escala 0-10 para 0-5 estrelas.
   * @param {number} score — valor de 0 a 10
   * @returns {string} representação em estrelas
   */
  const renderStars = (score) => {
    const starCount = Math.round(score / 2);
    return Array.from({ length: 5 }, (_, i) => (i < starCount ? '★' : '☆')).join('');
  };

  return (
    <section style={styles.container} aria-label="Score do produto">
      <h3 style={styles.title}>Score do Produto</h3>

      <div style={styles.scoreRow}>
        {/* Score inteligente */}
        <div style={styles.scoreBlock}>
          <span style={styles.label}>Score Inteligente</span>
          {smartScore !== null ? (
            <>
              <span style={styles.scoreValue} aria-label={`Score inteligente: ${smartScore.toFixed(1)} de 10`}>
                {smartScore.toFixed(1)}
              </span>
              <span style={styles.stars} aria-hidden="true">
                {renderStars(smartScore)}
              </span>
              <span style={styles.scale}>/10</span>
            </>
          ) : (
            <p style={styles.placeholder} role="status">
              Score Inteligente disponível após 3 avaliações
            </p>
          )}
        </div>

        {/* Média simples */}
        <div style={styles.scoreBlock}>
          <span style={styles.label}>Média Simples</span>
          {simpleAverage !== null ? (
            <>
              <span style={styles.averageValue} aria-label={`Média simples: ${simpleAverage.toFixed(1)} de 5`}>
                {simpleAverage.toFixed(1)}
              </span>
              <span style={styles.stars} aria-hidden="true">
                {renderStars(simpleAverage * 2)}
              </span>
              <span style={styles.scale}>/5</span>
            </>
          ) : (
            <span style={styles.noData}>—</span>
          )}
        </div>
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
  scoreRow: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  scoreBlock: {
    flex: '1 1 140px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
    minWidth: 0,
  },
  label: {
    fontSize: '0.85rem',
    color: '#666',
    fontWeight: 500,
  },
  scoreValue: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#1565c0',
  },
  averageValue: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#555',
  },
  stars: {
    fontSize: '1.2rem',
    color: '#f9a825',
    letterSpacing: '2px',
  },
  scale: {
    fontSize: '0.8rem',
    color: '#999',
  },
  placeholder: {
    color: '#888',
    fontStyle: 'italic',
    margin: '0.5rem 0 0 0',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  noData: {
    fontSize: '1.5rem',
    color: '#ccc',
  },
};
