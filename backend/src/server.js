// Configuração principal do servidor Express
// Inclui middlewares de segurança (helmet), compressão e CORS
import { pathToFileURL } from 'node:url';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import authRoutes from './routes/auth-routes.js';
import productRoutes from './routes/product-routes.js';
import reviewRoutes from './routes/review-routes.js';
import { notFoundHandler, errorHandler } from './middleware/error-handler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais de segurança e performance
// helmet: define headers HTTP de segurança (X-Content-Type-Options, X-Frame-Options, CSP, etc.)
app.use(helmet());
app.use(cors());
app.use(compression());
// Limita tamanho do body para prevenir ataques de payload excessivo
app.use(express.json({ limit: '10kb' }));

// Rota de health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/products/:id/reviews', reviewRoutes);

// Middleware de rota não encontrada (deve vir após todas as rotas)
app.use(notFoundHandler);

// Middleware centralizado de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Inicia o servidor apenas quando executado diretamente (não em testes)
const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

export default app;
