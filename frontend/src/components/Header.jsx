import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../contexts/ThemeContext.jsx';
import ProductChat from './chat/ProductChat.jsx';

/**
 * Componente Header da aplicação.
 * Exibe logo, busca global, botões de autenticação e toggle de tema claro/escuro.
 */
export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [chatOpen, setChatOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) navigate(`/?q=${encodeURIComponent(trimmed)}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <Link to="/" style={styles.logo}>InsightReview</Link>

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

        <nav style={styles.authNav} aria-label="Navegação">
          {/* Toggle de tema */}
          <button className="theme-toggle" onClick={toggleTheme}
            aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}>
            <span>{isDark ? '☀️' : '🌙'}</span>
            <span className="theme-toggle-track">
              <span className={`theme-toggle-knob${isDark ? ' active' : ''}`} />
            </span>
          </button>

          {/* Botão do chat de recomendação */}
          <button
            onClick={() => setChatOpen(true)}
            style={styles.chatBtn}
            aria-label="Abrir assistente de recomendação"
            title="Precisa de ajuda para escolher um produto?"
          >
            🤖 Assistente
          </button>

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

      {/* Chat de recomendação */}
      {chatOpen && <ProductChat onClose={() => setChatOpen(false)} />}
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: 'var(--color-bg-header)',
    color: 'var(--color-text-header)',
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
    color: 'var(--color-text-header)',
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
    backgroundColor: 'var(--color-bg-input)',
    color: 'var(--color-text)',
  },
  searchButton: {
    padding: '0.45rem 0.8rem',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: 'var(--color-bg-header-btn)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
  },
  authNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  userArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: 'var(--color-text-header)',
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
  chatBtn: {
    display: 'flex', alignItems: 'center', gap: '0.3rem',
    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
    color: '#fff', cursor: 'pointer', fontSize: '0.85rem',
    padding: '0.35rem 0.7rem', borderRadius: '20px', whiteSpace: 'nowrap',
  },
  authLink: {
    color: 'var(--color-text-header)',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  authLinkPrimary: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '0.9rem',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    backgroundColor: 'var(--color-bg-header-btn)',
  },
};
