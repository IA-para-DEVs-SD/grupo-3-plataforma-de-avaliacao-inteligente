/**
 * Componente de Score Inteligente com indicador de confiança Bayesiano.
 * Exibe o score ponderado (0–10), a média simples e uma barra de confiança
 * que indica o quão confiável é o score baseado no volume de avaliações.
 *
 * @param {{ smartScore: number|null, simpleAverage: number|null, smartScoreConfidence: number|null }} props
 */
export default function SmartScore({ smartScore, simpleAverage, smartScoreConfidence }) {
  /** Converte score 0-10 para estrelas 0-5 */
  const renderStars = (score) => {
    const starCount = Math.round(score / 2);
    return Array.from({ length: 5 }, (_, i) => (i < starCount ? '★' : '☆')).join('');
  };

  /** Retorna cor da barra de confiança baseada no percentual */
  const confidenceColor = (pct) => {
    if (pct >= 75) return '#2e7d32'; // verde
    if (pct >= 40) return '#f57c00'; // laranja
    return '#c62828';                // vermelho
  };

  /** Rótulo textual do nível de confiança */
  const confidenceLabel = (pct) => {
    if (pct >= 75) return 'Alta confiança';
    if (pct >= 40) return 'Confiança moderada';
    return 'Poucas avaliações';
  };

  return (
    <section style={styles.container} aria-label="Score do produto">
      <h3 style={styles.title}>Score do Produto</h3>

      <div style={styles.scoreRow}>
        {/* Score inteligente */}
        <div style={styles.scoreBlock}>
          <span style={styles.label}>Score Inteligente</span>
          {smartScore != null ? (
            <>
              <span
                style={styles.scoreValue}
                aria-label={`Score inteligente: ${smartScore.toFixed(1)} de 10`}
              >
                {smartScore.toFixed(1)}
              </span>
              <span style={styles.stars} aria-hidden="true">
                {renderStars(smartScore)}
              </span>
              <span style={styles.scale}>/10</span>

              {/* Barra de confiança */}
              {smartScoreConfidence != null && (
                <div style={styles.confidenceWrapper} aria-label={`Confiança: ${smartScoreConfidence}%`}>
                  <div style={styles.confidenceBarBg}>
                    <div
                      style={{
                        ...styles.confidenceBarFill,
                        width: `${smartScoreConfidence}%`,
                        backgroundColor: confidenceColor(smartScoreConfidence),
                      }}
                    />
                  </div>
                  <span
                    style={{
                      ...styles.confidenceText,
                      color: confidenceColor(smartScoreConfidence),
                    }}
                  >
                    {confidenceLabel(smartScoreConfidence)} ({smartScoreConfidence}%)
                  </span>
                </div>
              )}
            </>
          ) : (
            <p style={styles.placeholder} role="status">
              Disponível após 3 avaliações
            </p>
          )}
        </div>

        {/* Média simples */}
        <div style={styles.scoreBlock}>
          <span style={styles.label}>Média Simples</span>
          {simpleAverage != null ? (
            <>
              <span
                style={styles.averageValue}
                aria-label={`Média simples: ${simpleAverage.toFixed(1)} de 5`}
              >
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

const styles = {
  container: { padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-bg-card)' },
  title: { margin: '0 0 0.75rem 0', fontSize: '1.1rem', color: 'var(--color-text)' },
  scoreRow: { display: 'flex', gap: '2rem', flexWrap: 'wrap' },
  scoreBlock: { flex: '1 1 140px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', minWidth: 0 },
  label: { fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 },
  scoreValue: { fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-score)' },
  averageValue: { fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-muted)' },
  stars: { fontSize: '1.2rem', color: 'var(--color-star)', letterSpacing: '2px' },
  scale: { fontSize: '0.8rem', color: 'var(--color-text-faint)' },
  placeholder: { color: 'var(--color-text-faint)', fontStyle: 'italic', margin: '0.5rem 0 0 0', fontSize: '0.9rem', textAlign: 'center' },
  noData: { fontSize: '1.5rem', color: 'var(--color-border)' },
  confidenceWrapper: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', marginTop: '0.4rem' },
  confidenceBarBg: { width: '100%', height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' },
  confidenceBarFill: { height: '100%', borderRadius: '3px', transition: 'width 0.4s ease' },
  confidenceText: { fontSize: '0.75rem', fontWeight: 500 },
};
