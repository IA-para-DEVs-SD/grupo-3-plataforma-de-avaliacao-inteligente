/**
 * Filtros de avaliações — sentimento, nota e ordenação.
 */
export default function ReviewFilters({ sentiment, sort, rating, onFilterChange, onSortChange, onRatingChange }) {
  return (
    <div style={styles.container} role="group" aria-label="Filtros de avaliações">
      <div style={styles.filterGroup}>
        <label htmlFor="sentiment-filter" style={styles.label}>Sentimento</label>
        <select id="sentiment-filter" value={sentiment || ''} onChange={(e) => onFilterChange(e.target.value)} style={styles.select}>
          <option value="">Todos</option>
          <option value="positive">Positivas</option>
          <option value="neutral">Neutras</option>
          <option value="negative">Negativas</option>
        </select>
      </div>

      <div style={styles.filterGroup}>
        <label htmlFor="rating-filter" style={styles.label}>Nota</label>
        <select id="rating-filter" value={rating || ''} onChange={(e) => onRatingChange(e.target.value)} style={styles.select}>
          <option value="">Todas</option>
          <option value="5">★★★★★ (5)</option>
          <option value="4">★★★★☆ (4)</option>
          <option value="3">★★★☆☆ (3)</option>
          <option value="2">★★☆☆☆ (2)</option>
          <option value="1">★☆☆☆☆ (1)</option>
        </select>
      </div>

      <div style={styles.filterGroup}>
        <label htmlFor="sort-filter" style={styles.label}>Ordenar por</label>
        <select id="sort-filter" value={sort || ''} onChange={(e) => onSortChange(e.target.value)} style={styles.select}>
          <option value="">Mais recentes</option>
          <option value="rating_asc">Nota crescente</option>
          <option value="rating_desc">Nota decrescente</option>
        </select>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '0.75rem 0' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  label: { fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 },
  select: {
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid var(--color-border-input)',
    fontSize: '0.9rem',
    backgroundColor: 'var(--color-bg-input)',
    color: 'var(--color-text)',
    cursor: 'pointer',
    minWidth: '150px',
  },
};
