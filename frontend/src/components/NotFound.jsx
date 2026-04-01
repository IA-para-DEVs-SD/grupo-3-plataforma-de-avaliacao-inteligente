import { Link } from 'react-router-dom';

/**
 * Página de erro 404 — rota não encontrada.
 */
export default function NotFound() {
  return (
    <main style={styles.container} aria-label="Página não encontrada">
      <span style={styles.code}>404</span>
      <h1 style={styles.title}>Página não encontrada</h1>
      <p style={styles.message}>
        A página que você está procurando não existe ou foi removida.
      </p>
      <Link to="/" style={styles.link}>Voltar para a página inicial</Link>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: '480px',
    margin: '4rem auto',
    padding: '2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  code: {
    fontSize: '5rem',
    fontWeight: 700,
    color: 'var(--color-border)',
    lineHeight: 1,
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    color: 'var(--color-text)',
  },
  message: {
    margin: 0,
    color: 'var(--color-text-muted)',
    lineHeight: 1.6,
  },
  link: {
    marginTop: '0.5rem',
    color: 'var(--color-link)',
    textDecoration: 'none',
    fontWeight: 500,
    padding: '0.6rem 1.2rem',
    border: '1px solid var(--color-link)',
    borderRadius: '6px',
  },
};
