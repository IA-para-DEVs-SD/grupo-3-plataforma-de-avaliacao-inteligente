import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

/**
 * Provider de tema — gerencia alternância entre modo claro e escuro.
 * Persiste a preferência no localStorage e respeita a preferência do sistema operacional.
 */
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // Prioridade: preferência salva → preferência do sistema
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Aplica atributo no <html> para as variáveis CSS funcionarem
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook para acessar o contexto de tema.
 * Deve ser usado dentro de um ThemeProvider.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  return context;
}

export default ThemeContext;
