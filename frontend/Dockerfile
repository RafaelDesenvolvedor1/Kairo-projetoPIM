# Etapa 1: Build da aplicação React
FROM node:22-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ARG VITE_API_PORT
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_PORT=$VITE_API_PORT

RUN npm run build

# Etapa 2: Servidor Nginx com Proxy Reverso
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração do Nginx tratando SPA e repassando /api para o backend
RUN echo 'server { \
    listen 80; \
    \
    # Roteamento SPA (React Router) \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Proxy reverso: repassa chamadas /api para o container do backend \
    location /api/ { \
        proxy_pass http://backend:3000/; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_cache_bypass $http_upgrade; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]