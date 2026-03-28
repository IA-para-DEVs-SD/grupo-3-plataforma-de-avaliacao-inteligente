#!/bin/bash
# Roda o seed dentro do container do backend para popular o banco com dados de exemplo
# Uso: bash scripts/docker-seed.sh

echo "Populando banco de dados com dados de exemplo..."
docker compose exec backend node src/database/seed.js
echo "Pronto! Acesse http://localhost para usar a aplicação."
