import ReviewCard from './ReviewCard.jsx';

/**
 * Lista paginada de avaliações com controles de navegação.
 * Exibe mensagem contextual quando filtros estão ativos e não há resultados.
 */
export default function ReviewList({ reviews, page, totalPages, loading, onPageChange, filters, onClearFilters }) {
  if (loading) {
    return <p role="status" style={styles.status}>Carregando avaliações...</p>;
  }

  // Verifica se há algum filtro ativo
  const hasActiveFilters = filters && (filters.sentiment || filters.rating || filters.pattern);

  if (!reviews || reviews.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <p role="status" style={styles.status}>
          {hasActiveFilters
            ? 'Nenhuma avaliação encontrada com os filtros selecionados.'
            : 'Nenhuma avaliação encontrada.'}
        </p>
        {hasActiveFilters && onClearFilters && (
          <button onClick={onClearFilters} style={styles.clearButton} type="button">
            Limpar filtros
          </button>
        )}
      </div>
    );
  }

  return (
    <section aria-label="Lista de avaliações">
      <div style={styles.list}>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav style={styles.pagination} aria-label="Paginação de avaliações">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            style={{ ...styles.pageButton, ...(page <= 1 ? styles.pageButtonDisabled : {}) }}
            aria-label="Página anterior"
          >
            Anterior
          </button>
          <span style={styles.pageInfo}>Página {page} de {totalPages}</span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            style={{ ...styles.pageButton, ...(page >= totalPages ? styles.pageButtonDisabled : {}) }}
            aria-label="Próxima página"
          >
            Próxima
          </button>
        </nav>
      )}
    </section>
  );
}

const styles = {
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  emptyContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1.5rem 0' },
  status: { textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0 },
  clearButton: {
    padding: '0.5rem 1rem', borderRadius: '6px',
    border: '1px solid var(--color-border-input)',
    backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)',
    cursor: 'pointer', fontSize: '0.9rem',
  },
  pagination: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: '1rem', marginTop: '1.5rem', padding: '0.75rem 0',
  },
  pageButton: {
    padding: '0.5rem 1rem', borderRadius: '6px',
    border: '1px solid var(--color-border-input)',
    backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)',
    cursor: 'pointer', fontSize: '0.9rem',
  },
  pageButtonDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  pageInfo: { fontSize: '0.9rem', color: 'var(--color-text-muted)' },
};
