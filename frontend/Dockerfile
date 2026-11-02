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

# Etapa 2: Servidor Nginx com Proxy Reverso e Cabeçalhos de Segurança Hardened
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração do Nginx: SPA, Segurança de Cabeçalhos, Gzip e Proxy
# Configuração do Nginx: SPA, Segurança de Cabeçalhos, Gzip e Proxy
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Oculta a versão do Nginx \
    server_tokens off; \
    \
    # Compressão Gzip \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml; \
    \
    # 1. Regra para robots.txt e sitemap \
    location ~* ^/(robots\.txt|sitemap\.xml)$ { \
        try_files $uri =404; \
        access_log off; \
        log_not_found off; \
    } \
    \
    # 2. Ativos estáticos com hash (Cache longo) \
    location ~* \.(?:js|css|woff2?|svg|png|jpg|jpeg|gif|ico|webp)$ { \
        expires 1y; \
        add_header Cache-Control "public, max-age=31536000, immutable"; \
        access_log off; \
    } \
    \
    # 3. Roteamento SPA com todos os cabeçalhos aplicados diretamente \
    location / { \
        try_files $uri $uri/ /index.html; \
        \
        add_header Cache-Control "no-cache, no-store, must-revalidate" always; \
        add_header X-Frame-Options "SAMEORIGIN" always; \
        add_header X-Content-Type-Options "nosniff" always; \
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always; \
        add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always; \
        add_header Referrer-Policy "strict-origin-when-cross-origin" always; \
        add_header Cross-Origin-Opener-Policy "same-origin-allow-popups" always; \
        add_header Cross-Origin-Resource-Policy "cross-origin" always; \
        add_header Content-Security-Policy "default-src '\''self'\''; script-src '\''self'\'' '\''unsafe-inline'\'' https://tally.so; style-src '\''self'\'' '\''unsafe-inline'\'' https://fonts.googleapis.com; font-src '\''self'\'' data: https://fonts.gstatic.com; img-src '\''self'\'' data: blob: https:; frame-src '\''self'\'' https://tally.so; connect-src '\''self'\'' https:;" always; \
    } \
    \
    # 4. Proxy reverso para o backend \
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