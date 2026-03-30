const express = require("express");
const cors = require("cors");
const compression = require("compression");
require("dotenv").config();

const { notFoundHandler, errorHandler } = require("./middleware/error-handler");

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares globais
app.use(cors());
app.use(compression());
app.use(express.json());

// Rota de health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// TODO: registrar rotas (auth, products, reviews)

// Middleware de rota não encontrada (deve vir após todas as rotas)
app.use(notFoundHandler);

// Middleware centralizado de tratamento de erros (deve ser o último)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
