FROM node:22-slim

# Dependências de sistema (apenas se seu backend compilar pacotes nativos como bcrypt)
RUN apt-get update && apt-get install -y curl build-essential python3 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia dependências (o contexto de build será a pasta ./backend)
COPY package*.json ./

# Instala apenas dependências de produção
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

# Executa direto via node
CMD ["node", "index.js"]