FROM node:22-slim

# Instala dependências básicas do sistema
RUN apt-get update && apt-get install -y curl build-essential python3 && rm -rf /var/lib/apt/lists/*

# Define o diretório de trabalho no container
WORKDIR /app

# Copia os arquivos de dependência de dentro da pasta backend
COPY backend/package*.json ./

# Instala as dependências dentro do container
RUN npm install

# Copia todo o conteúdo da pasta backend para o WORKDIR
COPY backend/ . 

# Expõe a porta que a API utiliza
EXPOSE 3000

# Comando para rodar com hot reload (nodemon)
CMD ["npm", "run", "dev"]