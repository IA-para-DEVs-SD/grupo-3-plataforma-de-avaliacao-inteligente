import { useState, useEffect } from 'react';
import { useProducts } from '../../hooks/useProducts.js';
import ProductCard from './ProductCard.jsx';

/**
 * Componente de busca de produtos.
 * Carrega todos os produtos ao montar e permite busca por termo.
 * Exibe campo de busca, spinner de carregamento, lista de resultados
 * (ProductCard) e mensagem quando nenhum resultado é encontrado.
 */
export default function ProductSearch() {
  const { products, loading, error, search } = useProducts();
  const [query, setQuery] = useState('');
  // Controla se uma busca já foi realizada (para exibir mensagem de vazio)
  const [hasSearched, setHasSearched] = useState(false);

  // Carrega todos os produtos ao montar o componente
  useEffect(() => {
    search('');
    setHasSearched(true);
  }, [search]);

  /** Dispara a busca ao submeter o formulário */
  async function handleSubmit(event) {
    event.preventDefault();
    setHasSearched(true);
    await search(query.trim());
  }

  return (
    <section aria-label="Busca de produtos" style={styles.container}>
      <form onSubmit={handleSubmit} role="search" style={styles.form}>
        <label htmlFor="product-search" style={styles.srOnly}>
          Buscar produtos
        </label>
        <input
          id="product-search"
          type="search"
          placeholder="Buscar por nome ou categoria..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          style={styles.input}
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {/* Spinner de carregamento */}
      {loading && (
        <p role="status" style={styles.status}>
          Carregando resultados...
        </p>
      )}

      {/* Mensagem de erro */}
      {error && (
        <p role="alert" style={styles.error}>
          {error}
        </p>
      )}

      {/* Mensagem de nenhum resultado encontrado (Requisito 2.3 / Task 4.1.6) */}
      {!loading && !error && hasSearched && products.length === 0 && (
        <p role="status" style={styles.empty}>
          Nenhum resultado encontrado
        </p>
      )}

      {/* Lista de resultados */}
      {products.length > 0 && (
        <ul style={styles.list} aria-label="Resultados da busca">
          {products.map((product) => (
            <li key={product.id} style={styles.listItem}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* Estilos inline para o POC */
const styles = {
  container: { maxWidth: '640px', margin: '0 auto', padding: '1rem' },
  form: { display: 'flex', gap: '0.5rem', marginBottom: '1rem' },
  input: {
    flex: 1, padding: '0.6rem 0.75rem', fontSize: '1rem',
    border: '1px solid var(--color-border-input)', borderRadius: '4px',
    backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)',
  },
  button: { padding: '0.6rem 1.2rem', cursor: 'pointer', fontSize: '1rem' },
  status: { color: 'var(--color-text-muted)', fontStyle: 'italic' },
  error: {
    color: 'var(--color-error-text)', backgroundColor: 'var(--color-error-bg)',
    padding: '0.75rem', borderRadius: '4px',
  },
  empty: { color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' },
  list: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  listItem: { margin: 0 },
  srOnly: {
    position: 'absolute', width: '1px', height: '1px', padding: 0,
    margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0,
  },
};
