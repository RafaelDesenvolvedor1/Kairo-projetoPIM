# Projeto PIM - Visão Geral de Dependências e Docker

## 1. Visão geral do projeto

O projeto está organizado em três camadas principais:

- `frontend/`: aplicação React + Vite para a interface do usuário.
- `backend/`: API Node.js usando Express, Passport, Sequelize e MySQL.
- `docker-compose.yml`: orquestra os serviços `mysql`, `backend` e `frontend` em containers.

Também existe um `package.json` na raiz do projeto. Ele contém dependências de autenticação (Passport), mas o desenvolvimento principal do backend e frontend ocorre dentro de suas próprias pastas.

---

## 2. Estrutura de pastas relevante

- `backend/`
  - `index.js`
  - `package.json`
  - `src/`
    - `controllers/`
    - `models/`
    - `routes/`
    - `services/`
    - `config/`
    - `middlewares.js`
    - `db.js`
    - `auth.js`
    - `boot.js`
    - `associate.js`

- `frontend/`
  - `package.json`
  - `vite.config.js`
  - `src/`
    - `components/`
    - `routes/`
    - `services/`
    - `context/`
    - `controllers/`

- `docker-compose.yml`
- `Dockerfile`
- `docs/`
- `backend/.env.example`
- `frontend/.env.example`

---

## 3. Dependências do frontend

### `frontend/package.json`

#### Dependências de produção

- `@tiptap/extension-text-align` ^3.22.1
- `@tiptap/pm` ^3.22.1
- `@tiptap/react` ^3.22.1
- `@tiptap/starter-kit` ^3.22.1
- `antd` ^5.29.3
- `axios` ^1.15.2
- `dayjs` ^1.11.19
- `react` ^19.2.0
- `react-dom` ^19.2.0
- `react-icons` ^5.5.0
- `react-router` ^7.9.5
- `recharts` ^3.8.1
- `styled-components` ^6.1.19

#### Dependências de desenvolvimento

- `@eslint/js` ^9.39.1
- `@types/react` ^19.2.2
- `@types/react-dom` ^19.2.2
- `@vitejs/plugin-react` ^5.1.0
- `baseline-browser-mapping` ^2.10.14
- `eslint` ^9.39.1
- `eslint-plugin-react-hooks` ^7.0.1
- `eslint-plugin-react-refresh` ^0.4.24
- `globals` ^16.5.0
- `vite` ^7.2.2

### Observações do frontend

- A aplicação usa **Vite** como bundler / servidor de desenvolvimento.
- O container frontend usa `npm install` a cada inicialização e then `npm run dev -- --host 0.0.0.0`.
- A porta exposta no Docker é `5173`.
- Variáveis de ambiente de frontend esperadas:
  - `VITE_API_HOST`
  - `VITE_API_PORT`
  - `VITE_API_URL`

---

## 4. Dependências do backend

### `backend/package.json`

#### Dependências de produção

- `bcrypt` ^6.0.0
- `body-parser` ^2.2.1
- `consign` ^0.1.6
- `cors` ^2.8.5
- `dotenv` ^17.2.3
- `express` ^5.1.0
- `googleapis` ^172.0.0
- `jwt-simple` ^0.5.6
- `mysql2` ^3.15.3
- `passport` ^0.7.0
- `passport-google-oauth20` ^2.0.0
- `passport-jwt` ^4.0.1
- `passport-local` ^1.0.0
- `sequelize` ^6.37.7

#### Dependências de desenvolvimento

- `nodemon` ^3.1.11

### Observações do backend

- O backend utiliza **Express 5**, **Passport** para autenticação e **Sequelize** como ORM MySQL.
- `googleapis` indica integração com APIs Google, provavelmente usado na autenticação ou em serviços como Google Calendar.
- `mysql2` é o driver para conexão com banco MySQL.
- `dotenv` carrega variáveis de ambiente.

---

## 5. Dependências da raiz do projeto

### `package.json` da raiz

Dependências listadas:

- `passport-google-oauth20` ^2.0.0
- `passport-local` ^1.0.0

> Observação: este `package.json` não contém scripts e parece ser um arquivo auxiliar. O backend possui sua própria configuração de dependências em `backend/package.json`.

---

## 6. Arquivo `Dockerfile`

O `Dockerfile` está na raiz do projeto e cria a imagem base para o serviço `backend`:

- Base: `node:22-slim`
- Instala pacotes de sistema: `curl`, `build-essential`, `python3`
- Define `WORKDIR /app`
- Copia `backend/package*.json` para instalar dependências do backend
- Executa `npm install`
- Copia o conteúdo de `backend/` para `/app`
- Expõe `3000`
- Comando padrão: `npm run dev`

---

## 7. Estrutura do `docker-compose.yml`

### Rede

- `projeto-pim-network` (driver `bridge`)

### Volumes

- `mysql_data`: persistência dos dados MySQL em `/var/lib/mysql`

### Serviço `mysql`

- Imagem: `mysql:8.0`
- Container: `projeto-pim-mysql`
- Reinício: `unless-stopped`
- Porta: `3306:3306`
- Variáveis de ambiente:
  - `MYSQL_ROOT_PASSWORD`
  - `MYSQL_DATABASE`
  - `MYSQL_USER`
  - `MYSQL_PASSWORD`
- Volume: `mysql_data:/var/lib/mysql`
- Rede: `projeto-pim-network`

### Serviço `backend`

- Build: `.` (Dockerfile da raiz)
- Container: `projeto-pim-backend`
- Reinício: `unless-stopped`
- Volumes:
  - `./backend:/app`
  - `/app/node_modules`
- Diretório de trabalho: `/app`
- Comando: `npm run dev`
- Arquivo de ambiente: `.env` (da raiz)
- Variáveis de ambiente:
  - `DB_HOST`
  - `DB_PORT`
  - `DB_USER`
  - `DB_PASS`
  - `DB_NAME`
  - `PORT` (mapeado a `BACKEND_PORT`)
  - `JWT_SECRET`
- Porta: `3000:3000`
- Depende de: `mysql`
- Rede: `projeto-pim-network`

### Serviço `frontend`

- Imagem: `node:22`
- Container: `projeto-pim-frontend`
- Reinício: `unless-stopped`
- Diretório de trabalho: `/app`
- Volumes:
  - `./frontend:/app`
  - `/app/node_modules`
- Ambiente:
  - `VITE_API_PORT`
  - `VITE_API_URL`
- Porta: `5173:5173`
- Comando: `sh -c "npm install && npm run dev -- --host 0.0.0.0"`
- Depende de: `backend`
- Rede: `projeto-pim-network`

---

## 8. Variáveis de ambiente esperadas

### Variáveis comuns para `docker-compose`

- `MYSQL_ROOT_PASSWORD`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASS`
- `DB_NAME`
- `BACKEND_PORT`
- `JWT_SECRET`
- `VITE_API_PORT`
- `VITE_API_URL`

### Exemplo de `backend/.env.example`

```env
DB_HOST=
DB_PORT=
DB_USER=
DB_PASS=
DB_NAME=
PORT=3000
```

### Exemplo de `frontend/.env.example`

```env
VITE_API_HOST=localhost
VITE_API_PORT=3000
```

---

## 9. Dicas para manutenção e execução

- Para rodar localmente sem Docker:
  - `cd backend && npm install && npm run dev`
  - `cd frontend && npm install && npm run dev`
- Para rodar com Docker:
  - Configure as variáveis de ambiente no arquivo `.env` na raiz
  - Execute `docker-compose up -d`
- O frontend depende do backend e o backend depende do MySQL.
- O serviço `frontend` instala dependências no startup, então a primeira inicialização pode demorar mais.
- O volume `/app/node_modules` em ambos `backend` e `frontend` protege os módulos instalados dentro do container enquanto mantém o código fonte sincronizado.
- Verifique se a porta `5173` e `3000` estão livres antes de iniciar via Docker.
- Se for depurar a API, a porta padrão do backend é `3000`.

---

## 10. Pontos de atenção

- A raiz do projeto possui `package.json`, mas o backend e frontend têm seus próprios `package.json` separados. Para evitar confusão, use `npm` dentro de `backend/` e `frontend/` conforme o serviço.
- O `docker-compose.yml` não define explicitamente um `env_file` para o serviço MySQL, mas usa variáveis de ambiente do ambiente do Docker Compose. Coloque esses valores no `.env` da raiz ou exporte-os antes de subir o stack.
- O backend tem integração de autenticação com Passport e Google OAuth, então variáveis como `JWT_SECRET` e credenciais do Google são críticas para autenticação.
- Para facilitar manutenção futura, documente também o arquivo `.env` raiz e inclua instruções de criação de banco e tabelas se ainda não estiverem automatizadas.
