// Configuração principal do servidor Express
import { pathToFileURL } from 'node:url';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { errorMiddleware } from './middleware/error-middleware.js';
import authRoutes from './routes/auth-routes.js';
import productRoutes from './routes/product-routes.js';
import reviewRoutes from './routes/review-routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(cors());
app.use(compression());
app.use(express.json());

// Rota de health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/products/:id/reviews', reviewRoutes);

// Middleware centralizado de erros (deve ser o último middleware registrado)
app.use(errorMiddleware);

// Inicia o servidor apenas quando executado diretamente (não em testes)
const isMainModule = process.argv[1]
  && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

export default app;
