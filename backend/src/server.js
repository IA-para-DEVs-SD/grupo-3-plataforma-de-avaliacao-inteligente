const express = require('express');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares globais
app.use(cors());
app.use(compression());
app.use(express.json());

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// TODO: registrar rotas (auth, products, reviews)

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
