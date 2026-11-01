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

# Etapa 2: Servidor Nginx com Proxy Reverso e Otimizações de Cache
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração do Nginx: SPA, Cache de estáticos, Gzip e Proxy Reverso para /api
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Habilitar compressão Gzip para diminuir tamanho de transferência \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml; \
    \
    # 1. Regra para robots.txt e sitemap (não devem passar pelo fallback do React) \
    location ~* ^/(robots\.txt|sitemap\.xml)$ { \
        try_files $uri =404; \
        access_log off; \
        log_not_found off; \
    } \
    \
    # 2. Ativos estáticos com hash (JS, CSS, Imagens, Fontes) com Cache de 1 ano \
    location ~* \.(?:js|css|woff2?|svg|png|jpg|jpeg|gif|ico|webp)$ { \
        expires 1y; \
        add_header Cache-Control "public, max-age=31536000, immutable"; \
        access_log off; \
    } \
    \
    # 3. Roteamento SPA: o index.html não deve ter cache rígido para permitir deploys \
    location / { \
        try_files $uri $uri/ /index.html; \
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
    } \
    \
    # 4. Proxy reverso: repassa chamadas /api para o container do backend \
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