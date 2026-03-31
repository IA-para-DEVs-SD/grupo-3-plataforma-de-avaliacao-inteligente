/**
 * Filtros de avaliações — seletores de sentimento e ordenação por nota.
 * Chama callbacks onFilterChange e onSortChange ao alterar valores.
 * @param {object} props
 * @param {string | null} props.sentiment — filtro de sentimento ativo ('positive', 'neutral', 'negative' ou null)
 * @param {string | null} props.sort — ordenação ativa ('rating_asc', 'rating_desc' ou null para recentes)
 * @param {(value: string) => void} props.onFilterChange — callback ao alterar filtro de sentimento
 * @param {(value: string) => void} props.onSortChange — callback ao alterar ordenação
 * @returns {JSX.Element}
 */
export default function ReviewFilters({ sentiment, sort, onFilterChange, onSortChange }) {
  const handleSentimentChange = (e) => {
    onFilterChange(e.target.value);
  };

  const handleSortChange = (e) => {
    onSortChange(e.target.value);
  };

  return (
    <div style={styles.container} role="group" aria-label="Filtros de avaliações">
      <div style={styles.filterGroup}>
        <label htmlFor="sentiment-filter" style={styles.label}>Sentimento</label>
        <select
          id="sentiment-filter"
          value={sentiment || ''}
          onChange={handleSentimentChange}
          style={styles.select}
        >
          <option value="">Todos</option>
          <option value="positive">Positivas</option>
          <option value="neutral">Neutras</option>
          <option value="negative">Negativas</option>
        </select>
      </div>

      <div style={styles.filterGroup}>
        <label htmlFor="sort-filter" style={styles.label}>Ordenar por</label>
        <select
          id="sort-filter"
          value={sort || ''}
          onChange={handleSortChange}
          style={styles.select}
        >
          <option value="">Mais recentes</option>
          <option value="rating_asc">Nota crescente</option>
          <option value="rating_desc">Nota decrescente</option>
        </select>
      </div>
    </div>
  );
}

/* Estilos inline para o POC */
const styles = {
  container: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    padding: '0.75rem 0',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  label: {
    fontSize: '0.8rem',
    color: '#666',
    fontWeight: 500,
  },
  select: {
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '0.9rem',
    backgroundColor: '#fff',
    cursor: 'pointer',
    minWidth: '160px',
  },
};
