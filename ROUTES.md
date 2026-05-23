# Rotas do Projeto

Este documento lista as rotas do backend e do frontend do projeto.

## Backend

### Autenticação e Google OAuth
- GET `/` - API root
- POST `/token` - login por email/senha
- POST `/users` - cadastro de usuário
- GET `/user` - obter dados do usuário logado (requisição autenticada)
- DELETE `/user` - excluir usuário logado (requisição autenticada)
- GET `/auth/google` - inicia fluxo de autenticação com Google
- GET `/auth/google/callback` - callback do Google OAuth
- GET `/auth/google/failure` - página de falha no login Google
- POST `/auth/google/logout` - desconectar Google
- GET `/auth/google/tokens/:id_usuario` - obter tokens do Google para integração com Calendar

### Locais
- GET `/locais` - lista locais do usuário logado
- POST `/locais` - cria um local
- GET `/locais/:id` - obter local específico
- PUT `/locais/:id` - atualizar local
- DELETE `/locais/:id` - excluir local

### Serviços
- GET `/servicos` - lista serviços do usuário logado
- POST `/servicos` - cria um serviço
- GET `/servicos/:id` - obter serviço específico
- PUT `/servicos/:id` - atualizar serviço
- DELETE `/servicos/:id` - excluir serviço

### Horários
- GET `/horarios` - lista horários do usuário logado
- POST `/horarios` - cria um horário
- GET `/horarios/:id` - obter horário específico
- PUT `/horarios/:id` - atualizar horário
- DELETE `/horarios/:id` - excluir horário

### Pacientes
- GET `/pacientes` - lista pacientes do usuário logado
- POST `/pacientes` - cria paciente
- GET `/pacientes/count` - conta pacientes do usuário logado
- GET `/pacientes/nome/:nome` - busca paciente por nome exato
- GET `/pacientes/search?nome=...` - busca paciente por nome parcial
- GET `/pacientes/:id` - obter paciente específico
- PUT `/pacientes/:id` - atualizar paciente
- DELETE `/pacientes/:id` - excluir paciente

### Financeiro / Lançamentos
- GET `/lancamentos/pacientes/lista` - lista pacientes para seleção de lançamento
- GET `/lancamentos/consolidado/periodo?mes=YYYY-MM` - consolida valores por período
- GET `/lancamentos` - lista lançamentos do usuário logado
- POST `/lancamentos` - cria lançamento
- GET `/lancamentos/:id` - obter lançamento específico
- PUT `/lancamentos/:id` - atualizar lançamento
- DELETE `/lancamentos/:id` - excluir lançamento

### Google Calendar (opcional)
- POST `/calendario/evento` - criar evento no Google Calendar
- GET `/calendario/eventos/:id_usuario` - listar eventos do Google Calendar
- PUT `/calendario/evento/:eventId` - atualizar evento
- DELETE `/calendario/evento/:eventId` - excluir evento

## Frontend

### Rotas do React Router
- `/` - Home (componente `Home.jsx`)
- `/pacientes` - Pacientes (componente `Pacientes.jsx`)
- `/pacientes/dates` - PacientesDates (componente `PacientesDates/index.jsx`)
- `/financeiro` - Financeiro (componente `Financeiro/index.jsx`)
- `/agendamentos` - Agendamentos (componente `Agendamentos/index.jsx`)
- `/locais` - Locais (componente `Locais/index.jsx`)
- `/servicos` - Serviços (componente `Servicos/index.jsx`)
- `/horarios` - Horários (componente `Horarios/index.jsx`)
- `/login` - Login (componente `Login/index.jsx`)
- `/cadastro` - Cadastro (componente `Cadastro/index.jsx`)

### Observações do frontend
- O componente principal `App.jsx` é protegido por `ProtectedRoute` para as rotas internas.
- `/login` e `/cadastro` são rotas públicas.
- A rota `/` carrega o componente `Home.jsx` dentro do layout protegido.
