/**
 * Gráfico de distribuição de sentimento com barras horizontais.
 */
export default function SentimentChart({ distribution }) {
  if (!distribution) return null;
  const { positive = 0, neutral = 0, negative = 0 } = distribution;

  const bars = [
    { label: 'Positivas', value: positive, colorVar: 'var(--color-text-positive)', bgVar: 'var(--color-bg-badge-positive)' },
    { label: 'Neutras',   value: neutral,  colorVar: 'var(--color-text-neutral)',  bgVar: 'var(--color-bg-badge-neutral)'  },
    { label: 'Negativas', value: negative, colorVar: 'var(--color-text-negative)', bgVar: 'var(--color-bg-badge-negative)' },
  ];

  return (
    <section style={styles.container} aria-label="Distribuição de sentimento">
      <h3 style={styles.title}>Análise de Sentimento</h3>
      <div style={styles.chartArea}>
        {bars.map(({ label, value, colorVar, bgVar }) => (
          <div key={label} style={styles.barRow}>
            <span style={styles.label}>{label}</span>
            <div style={styles.barTrack}
              role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}
              aria-label={`${label}: ${value.toFixed(1)}%`}>
              <div style={{ ...styles.barFill, width: `${Math.max(value, 0)}%`, backgroundColor: bgVar, borderLeft: `3px solid ${colorVar}` }} />
            </div>
            <span style={{ ...styles.percentage, color: colorVar }}>{value.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}

const styles = {
  container: { padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-bg-card)' },
  title: { margin: '0 0 0.75rem 0', fontSize: '1.1rem', color: 'var(--color-text)' },
  chartArea: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  barRow: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  label: { width: '80px', fontSize: '0.85rem', color: 'var(--color-text-muted)', flexShrink: 0 },
  barTrack: { flex: 1, height: '20px', backgroundColor: 'var(--color-bg)', borderRadius: '4px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '4px', transition: 'width 0.3s ease' },
  percentage: { width: '50px', fontSize: '0.85rem', fontWeight: 600, textAlign: 'right', flexShrink: 0 },
};
