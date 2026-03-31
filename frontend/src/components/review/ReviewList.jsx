import ReviewCard from './ReviewCard.jsx';

/**
 * Lista paginada de avaliações com controles de navegação.
 * Exibe estado de loading, mensagem de lista vazia e paginação.
 * @param {object} props
 * @param {Array<object>} props.reviews — lista de avaliações a exibir
 * @param {number} props.page — número da página atual (1-indexed)
 * @param {number} props.totalPages — total de páginas disponíveis
 * @param {boolean} props.loading — indica se as avaliações estão sendo carregadas
 * @param {(page: number) => void} props.onPageChange — callback ao mudar de página
 * @returns {JSX.Element}
 */
export default function ReviewList({ reviews, page, totalPages, loading, onPageChange }) {
  // Estado de carregamento
  if (loading) {
    return (
      <p role="status" style={styles.status}>
        Carregando avaliações...
      </p>
    );
  }

  // Lista vazia
  if (!reviews || reviews.length === 0) {
    return (
      <p role="status" style={styles.status}>
        Nenhuma avaliação encontrada.
      </p>
    );
  }

  return (
    <section aria-label="Lista de avaliações">
      <div style={styles.list}>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Controles de paginação */}
      {totalPages > 1 && (
        <nav style={styles.pagination} aria-label="Paginação de avaliações">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            style={{
              ...styles.pageButton,
              ...(page <= 1 ? styles.pageButtonDisabled : {}),
            }}
            aria-label="Página anterior"
          >
            Anterior
          </button>

          <span style={styles.pageInfo}>
            Página {page} de {totalPages}
          </span>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            style={{
              ...styles.pageButton,
              ...(page >= totalPages ? styles.pageButtonDisabled : {}),
            }}
            aria-label="Próxima página"
          >
            Próxima
          </button>
        </nav>
      )}
    </section>
  );
}

/* Estilos inline para o POC */
const styles = {
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  status: {
    textAlign: 'center',
    padding: '2rem',
    color: '#555',
    fontStyle: 'italic',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '1.5rem',
    padding: '0.75rem 0',
  },
  pageButton: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  pageButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  pageInfo: {
    fontSize: '0.9rem',
    color: '#555',
  },
};
