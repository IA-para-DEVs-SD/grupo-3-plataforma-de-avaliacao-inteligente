# Dockerfile do frontend — Build estático React/Vite + Nginx
# Estágio 1: Build
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html ./
COPY vite.config.js ./
COPY src/ ./src/

# Build de produção — aponta API para /api (proxy via nginx)
ENV VITE_API_URL=/api
RUN npm run build

# Estágio 2: Servir com Nginx
FROM nginx:alpine

# Copia o build estático para o diretório do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuração do Nginx com proxy reverso para o backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
