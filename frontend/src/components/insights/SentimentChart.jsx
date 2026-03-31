/**
 * Gráfico de distribuição de sentimento.
 * Exibe barras horizontais com percentuais de avaliações positivas, neutras e negativas.
 * @param {object} props
 * @param {{ positive: number, neutral: number, negative: number } | null} props.distribution — distribuição percentual de sentimento
 * @returns {JSX.Element | null} null se distribution for null
 */
export default function SentimentChart({ distribution }) {
  if (!distribution) return null;

  const { positive = 0, neutral = 0, negative = 0 } = distribution;

  const bars = [
    { label: 'Positivas', value: positive, color: '#2e7d32', bgColor: '#e8f5e9' },
    { label: 'Neutras', value: neutral, color: '#616161', bgColor: '#f5f5f5' },
    { label: 'Negativas', value: negative, color: '#c62828', bgColor: '#fdecea' },
  ];

  return (
    <section style={styles.container} aria-label="Distribuição de sentimento">
      <h3 style={styles.title}>Análise de Sentimento</h3>
      <div style={styles.chartArea}>
        {bars.map(({ label, value, color, bgColor }) => (
          <div key={label} style={styles.barRow}>
            <span style={styles.label}>{label}</span>
            <div style={styles.barTrack} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={`${label}: ${value.toFixed(1)}%`}>
              <div
                style={{
                  ...styles.barFill,
                  width: `${Math.max(value, 0)}%`,
                  backgroundColor: bgColor,
                  borderLeft: `3px solid ${color}`,
                }}
              />
            </div>
            <span style={{ ...styles.percentage, color }}>{value.toFixed(1)}%</span>
          </div>
        ))}
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
  chartArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  label: {
    width: '80px',
    fontSize: '0.85rem',
    color: '#555',
    flexShrink: 0,
  },
  barTrack: {
    flex: 1,
    height: '20px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  percentage: {
    width: '50px',
    fontSize: '0.85rem',
    fontWeight: 600,
    textAlign: 'right',
    flexShrink: 0,
  },
};
