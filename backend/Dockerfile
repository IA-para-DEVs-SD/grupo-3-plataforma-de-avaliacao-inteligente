# Dockerfile do backend — API REST Node.js/Express com motor de IA
FROM node:20-alpine

WORKDIR /app

# Instala dependências de build para better-sqlite3 (compilação nativa)
RUN apk add --no-cache python3 make g++

# Copia apenas arquivos de dependência primeiro (cache de camadas)
COPY package.json package-lock.json ./

# Instala dependências de produção
RUN npm ci --omit=dev

# Copia o código-fonte
COPY src/ ./src/
COPY .env.example ./.env.example

# Cria diretório de dados para o SQLite
RUN mkdir -p /app/data

# Variáveis de ambiente padrão
ENV PORT=3000
ENV NODE_ENV=production
ENV DB_PATH=/app/data/insightreview.db
ENV JWT_SECRET=insightreview-docker-secret-change-me

EXPOSE 3000

# Comando de inicialização
CMD ["node", "src/server.js"]
