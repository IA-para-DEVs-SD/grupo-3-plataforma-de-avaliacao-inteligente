import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

/**
 * Componente de rota protegida.
 * Redireciona para /login se o usuário não estiver autenticado (Requisito 1.8).
 * Exibe indicador de carregamento enquanto o estado de autenticação é verificado.
 */
export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Aguarda verificação do estado de autenticação
  if (loading) {
    return <div data-testid="loading-indicator">Carregando...</div>;
  }

  // Redireciona para login se não autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
