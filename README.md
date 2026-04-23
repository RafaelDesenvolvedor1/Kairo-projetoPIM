# Projeto PIM

Monorepo com backend em Node.js/Express e frontend em React + Vite.

## Estrutura do projeto

- `backend/` - API REST usando Express, Sequelize e MySQL
- `frontend/` - Aplicação React usando Vite
- `Dockerfile` - Arquivo para containerizar o backend
- `docker-compose.yml` - Orquestração dos serviços (backend, frontend, MySQL)

## Tecnologias principais

- Backend
  - Node.js
  - Express
  - Sequelize
  - MySQL
  - dotenv
  - cors
  - body-parser
  - nodemon (desenvolvimento)

- Frontend
  - React
  - Vite
  - Ant Design
  - axios
  - react-router
  - styled-components
  - recharts
  - tiptap

- Infraestrutura
  - Docker
  - Docker Compose

## Requisitos

- Docker e Docker Compose (recomendado para execução completa)
- Ou, para execução manual:
  - Node.js 22+ (ou versão compatível)
  - npm ou yarn
  - MySQL rodando localmente ou remotamente

## Usando Docker (Recomendado)

Para executar o projeto completo com Docker, siga estes passos:

1. Certifique-se de que Docker e Docker Compose estão instalados.

2. Na raiz do projeto, execute:

```bash
docker compose up --build
```

- `--build` força a reconstrução das imagens.
- Use `-d` para rodar em background: `docker compose up -d --build`.

3. Acesse:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`
   - MySQL: Porta 3306 (usuário: `user`, senha: `password`, banco: `kairodb`)

### Observações sobre Docker:
- Os dados do MySQL são persistidos em um volume Docker.
- O frontend roda em modo desenvolvimento com hot reload.
- As variáveis de ambiente do frontend (`VITE_API_HOST`, `VITE_API_PORT`) já estão configuradas no docker-compose.yml para apontar para o serviço `backend` (nome do container).
- Para parar: `docker-compose down`
- Para resetar dados do banco: `docker-compose down -v`

## Configuração Manual do Backend

1. Acesse a pasta do backend:

```bash
cd backend
```

2. Instale as dependências:

```bash
npm install
```

3. Crie o arquivo de ambiente a partir do modelo:

```bash
cp .env.example .env
```

> No Windows PowerShell, use:
>
> ```powershell
> Copy-Item .env.example .env
> ```

4. Ajuste os valores em `backend/.env` conforme seu banco MySQL:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=root
DB_NAME=kairodb
PORT=3000
```

5. Inicie o backend:

```bash
npm run start
```

O servidor roda por padrão em `http://localhost:3000`.

## Configuração Manual do Frontend

1. Acesse a pasta do frontend:

```bash
cd frontend
```

2. Instale as dependências:

```bash
npm install
```

3. Crie o arquivo de ambiente a partir do modelo:

```bash
cp .env.example .env
```

> No Windows PowerShell, use:
>
> ```powershell
> Copy-Item .env.example .env
> ```

4. (Opcional) Ajuste as variáveis em `frontend/.env` conforme necessário:

```env
VITE_API_HOST=localhost
VITE_API_PORT=3000
```

- `VITE_API_HOST`: Endereço do backend (pode ser IP, domínio ou localhost)
- `VITE_API_PORT`: Porta onde o backend está rodando

5. Inicie a aplicação:

```bash
npm run dev
```

A aplicação frontend deve rodar em `http://localhost:5173`.

## API disponível

- `GET /` - Mensagem inicial da API
- `GET /pacientes` - Lista todos os pacientes
- `POST /pacientes` - Cria um novo paciente
- `GET /pacientes/:id` - Retorna paciente por ID
- `PUT /pacientes/:id` - Atualiza paciente por ID
- `DELETE /pacientes/:id` - Remove paciente por ID
- `GET /pacientes/search?nome=<texto>` - Busca pacientes por nome (LIKE)
- `GET /pacientes/nome/:nome` - Busca paciente por nome exato

## Observações importantes

- A aplicação backend utiliza CORS com origem fixa em `http://localhost:5173` no arquivo `backend/src/middlewares.js`.
- O Sequelize faz `sync()` automaticamente na inicialização, criando/modificando tabelas conforme os modelos.
- Se a porta `3000` já estiver em uso, ajuste `PORT` em `backend/.env`.

## Pastas adicionais
- `frontend/src/` - código-fonte React
- `backend/src/` - configuração do servidor, modelos e rotas

## Arquivos de configuração

### `.gitignore`

O repositório possui um `.gitignore` configurado para ignorar:

- Dependências (`node_modules/`, `package-lock.json`)
- Variáveis de ambiente (`.env`, `.env.local`)
- Builds e compilações (`dist/`, `build/`)
- Logs e arquivos temporários
- IDE e SO (`.vscode/`, `.idea/`, `.DS_Store`)

### `.env.example`

O backend possui um arquivo `.env.example` com as variáveis de ambiente necessárias. Copie-o para `.env` e ajuste conforme sua configuração local.

## Como contribuir

1. Faça um fork ou clone deste repositório.
2. Crie uma branch para sua feature ou correção.
3. Adicione pequenos commits claros.
4. Teste localmente o backend e o frontend.

---

Se precisar de ajuda para configurar o MySQL ou ajustar o CORS, posso orientar também.