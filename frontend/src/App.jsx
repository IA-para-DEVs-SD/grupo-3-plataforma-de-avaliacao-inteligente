import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header.jsx';
import './global.css';

// Lazy loading de componentes pesados — carregados sob demanda por rota
const ProductSearch = lazy(() => import('./components/product/ProductSearch.jsx'));
const ProductDetail = lazy(() => import('./components/product/ProductDetail.jsx'));
const LoginForm = lazy(() => import('./components/auth/LoginForm.jsx'));
const RegisterForm = lazy(() => import('./components/auth/RegisterForm.jsx'));

/**
 * Fallback de carregamento exibido enquanto componentes lazy são carregados.
 * @returns {JSX.Element} indicador de carregamento acessível
 */
function LoadingFallback() {
  return (
    <div style={styles.loading} role="status" aria-label="Carregando página">
      <p>Carregando...</p>
    </div>
  );
}

/**
 * Página inicial — exibe busca de produtos.
 * @returns {JSX.Element}
 */
function HomePage() {
  return (
    <main style={styles.main}>
      <ProductSearch />
    </main>
  );
}

/**
 * Página de login.
 * @returns {JSX.Element}
 */
function LoginPage() {
  return (
    <main style={styles.authMain}>
      <LoginForm />
    </main>
  );
}

/**
 * Página de cadastro.
 * @returns {JSX.Element}
 */
function RegisterPage() {
  return (
    <main style={styles.authMain}>
      <RegisterForm />
    </main>
  );
}

/**
 * Página de detalhes do produto.
 * @returns {JSX.Element}
 */
function ProductDetailPage() {
  return (
    <main style={styles.main}>
      <ProductDetail />
    </main>
  );
}

/**
 * Componente raiz da aplicação.
 * Define a estrutura de rotas com lazy loading e envolve tudo com o AuthProvider.
 * @returns {JSX.Element}
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

/* Estilos inline mínimos */
const styles = {
  main: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '1rem',
  },
  authMain: {
    maxWidth: '420px',
    margin: '2rem auto',
    padding: '1rem',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    color: '#555',
    fontStyle: 'italic',
  },
};
