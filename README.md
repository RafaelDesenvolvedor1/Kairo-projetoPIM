# Projeto PIM

Monorepo com backend em Node.js/Express e frontend em React + Vite.

## Estrutura do projeto

- `backend/` - API REST usando Express, Sequelize e MySQL
- `frontend/` - Aplicação React usando Vite
- `docs/` - Documentação e diagrama de implementação

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

## Requisitos

- Node.js 18+ (ou versão compatível)
- npm ou yarn
- MySQL rodando localmente ou remotamente

## Configuração do backend

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

## Configuração do frontend

1. Acesse a pasta do frontend:

```bash
cd frontend
```

2. Instale as dependências:

```bash
npm install
```

3. Inicie a aplicação:

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

- `docs/diagramaImplementacao.2.asta` - arquivo de diagrama de implementação
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
- Diretório `/docs` (documentação interna)

### `.env.example`

O backend possui um arquivo `.env.example` com as variáveis de ambiente necessárias. Copie-o para `.env` e ajuste conforme sua configuração local.

## Como contribuir

1. Faça um fork ou clone deste repositório.
2. Crie uma branch para sua feature ou correção.
3. Adicione pequenos commits claros.
4. Teste localmente o backend e o frontend.

---

Se precisar de ajuda para configurar o MySQL ou ajustar o CORS, posso orientar também.