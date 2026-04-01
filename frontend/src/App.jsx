import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header.jsx';
import ProductSearch from './components/product/ProductSearch.jsx';
import ProductDetail from './components/product/ProductDetail.jsx';
import LoginForm from './components/auth/LoginForm.jsx';
import RegisterForm from './components/auth/RegisterForm.jsx';
import NotFound from './components/NotFound.jsx';
import './global.css';

/**
 * Página inicial — exibe busca de produtos.
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
 * Define a estrutura de rotas e envolve tudo com o AuthProvider.
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="*" element={<main style={styles.main}><NotFound /></main>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
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
};
