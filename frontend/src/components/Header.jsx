import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

/**
 * Componente Header da aplicação.
 * Exibe logo/título, campo de busca global e botões de autenticação.
 */
export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  /** Navega para a página inicial com o termo de busca */
  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/?q=${encodeURIComponent(trimmed)}`);
    }
  };

  /** Realiza logout e redireciona para a página inicial */
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        {/* Logo / título */}
        <Link to="/" style={styles.logo}>InsightReview</Link>

        {/* Campo de busca global */}
        <form onSubmit={handleSearch} style={styles.searchForm} role="search">
          <input
            type="search"
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
            aria-label="Buscar produtos"
          />
          <button type="submit" style={styles.searchButton}>Buscar</button>
        </form>

        {/* Botões de autenticação */}
        <nav style={styles.authNav} aria-label="Autenticação">
          {isAuthenticated ? (
            <div style={styles.userArea}>
              <span style={styles.userName}>{user?.name}</span>
              <button onClick={handleLogout} style={styles.authButton}>Sair</button>
            </div>
          ) : (
            <div style={styles.userArea}>
              <Link to="/login" style={styles.authLink}>Entrar</Link>
              <Link to="/register" style={styles.authLinkPrimary}>Cadastrar</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

/* Estilos inline para o POC */
const styles = {
  header: {
    backgroundColor: '#1565c0',
    color: '#fff',
    padding: '0.75rem 1rem',
  },
  inner: {
    maxWidth: '960px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#fff',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  searchForm: {
    flex: 1,
    display: 'flex',
    gap: '0.4rem',
    minWidth: '180px',
  },
  searchInput: {
    flex: 1,
    padding: '0.45rem 0.6rem',
    borderRadius: '4px',
    border: 'none',
    fontSize: '0.9rem',
  },
  searchButton: {
    padding: '0.45rem 0.8rem',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#0d47a1',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
  },
  authNav: {
    display: 'flex',
    alignItems: 'center',
  },
  userArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  authButton: {
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    border: '1px solid rgba(255,255,255,0.5)',
    backgroundColor: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  authLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  authLinkPrimary: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '0.9rem',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    backgroundColor: '#0d47a1',
  },
};
