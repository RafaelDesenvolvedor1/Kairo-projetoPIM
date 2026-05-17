# 📊 Guia de Uso - Módulo Financeiro Kairo

## 🎯 Visão Geral

Implementação completa do módulo de Controle Financeiro com:
- ✅ Backend (Node.js + Express + Sequelize)
- ✅ Frontend (React + Ant Design + styled-components)
- ✅ Integração API completa
- ✅ Lógica dinâmica de formulário
- ✅ Três visualizações de dados

---

## 🗂️ Estrutura de Arquivos

### Backend
```
backend/
├── src/
│   ├── models/
│   │   ├── financeiro.js          → Modelo Lancamento (atualizado)
│   │   └── parcelalancamento.js   → Modelo Parcelalancamento (novo)
│   └── routes/
│       └── financeiro.js          → Rotas e controllers (novo)
├── associate.js                     → Relacionamentos (atualizado)
└── index.js                         → Entrypoint (Consign)
```

### Frontend
```
frontend/src/
├── services/
│   └── financeirosService.js       → Serviço API (novo)
├── components/
│   ├── FormNovoLancamento/         → Formulário dinâmico (novo)
│   │   ├── index.jsx
│   │   └── styles.js
│   └── CardPeriodo/                → Navegação período (novo)
│       ├── index.jsx
│       └── styles.js
└── routes/
    └── Financeiro/
        ├── index.jsx               → Componente principal (completo)
        ├── ViewPacientes.jsx       → Grid de pacientes (novo)
        ├── ViewLista.jsx           → Tabela de lançamentos (novo)
        ├── ViewGrid.jsx            → Cards lado a lado (novo)
        └── styles.js               → Estilos customizados (atualizado)
```

---

## 🚀 Como Usar

### 1. Backend - Iniciar o servidor

```bash
cd backend
npm install
npm run dev
```

A aplicação iniciará na porta **3000**.

### 2. Frontend - Iniciar o cliente

```bash
cd frontend
npm install
npm run dev
```

O frontend iniciará em **http://localhost:5173** (Vite).

---

## 📝 Fluxo de Uso - Frontend

### 1️⃣ **Tela Principal**

Ao acessar a rota `/financeiro`, você verá:

- **Cards de Consolidação** (topo)
  - Despesas á pagar
  - Receitas previstas
  - Receitas realizadas
  - Despesas realizadas

- **Seletor de Período**
  - Navegação mês/ano
  - Filtro por competência (YYYY-MM)

- **Seletor de Visualização** (Pacientes/Lista/Grid)

- **Controles** (Filtro, Download CSV, Novo Lançamento)

### 2️⃣ **Criar Novo Lançamento**

1. Clique em "Novo Lançamento"
2. Drawer lateral abre com formulário
3. Preencha os campos:

   **Campos Obrigatórios:**
   - Tipo: Receita ou Despesa
   - Categoria: Dinâmica baseada no tipo
   - Valor ou Prestações

   **Campos Opcionais:**
   - Paciente: Select com dropdown dos pacientes
   - Descrição: Texto livre

4. **Lógica Dinâmica:**
   - Se Tipo = **RECEITA**:
     - Categorias: "Receita atendimento", "Receita produto", "Receita outros"
     - Forma de Pagamento: À vista ou Parcelado (VISÍVEL)
   
   - Se Tipo = **DESPESA**:
     - Categorias: "Despesa Fixa", "Despesa em prestação"
     - Forma de Pagamento: INVISÍVEL se "Despesa Fixa", VISÍVEL se "Despesa em prestação"

5. **Seleção da Forma de Pagamento:**
   - **À vista**: Exibe InputNumber único + DatePicker
   - **Parcelado**: Exibe botão "+ Nova Prestação" para adicionar linhas com data_vencimento e valor_parcela

6. Clique em "Salvar Lançamento"

### 3️⃣ **Visualizar Lançamentos**

#### **Vista de Pacientes**
- Grid de cards com cada paciente
- Exibe nome, email, total de receita e despesa
- Clique para ir para lista detalhada

#### **Vista de Lista**
- Tabela com colunas: Data, Paciente, Descrição, Tipo, Categoria, Valor, Status, Ações
- Ordenação por data
- Paginação por 10 itens
- Ações: Editar (ícone de lápis), Deletar (ícone de lixeira)

#### **Vista de Grid**
- Cards lado a lado em grid responsivo
- Cada card exibe: categoria, descrição, paciente, data, valor, status
- Badge com número de parcelas (se parcelado)
- Ações: Editar, Deletar

---

## 🔌 Endpoints da API

### Base URL
```
http://localhost:3000
```

### Autenticação
Adicione header:
```
Authorization: Bearer {token}
```

### Endpoints

#### **Lançamentos (CRUD)**
```
GET    /lancamentos                    → Listar (com ?mes=YYYY-MM opcional)
POST   /lancamentos                    → Criar
GET    /lancamentos/:id                → Buscar específico
PUT    /lancamentos/:id                → Atualizar
DELETE /lancamentos/:id                → Deletar
```

#### **Dados para Formulário**
```
GET    /lancamentos/pacientes/lista    → Lista de pacientes do usuário
GET    /lancamentos/consolidado/periodo → Consolidação (com ?mes=YYYY-MM opcional)
```

---

## 📊 Exemplos de Payloads

### ✅ Criar Lançamento À Vista

```json
POST /lancamentos
{
  "tipo": "RECEITA",
  "categoria": "Receita atendimento",
  "descricao": "Atendimento do João",
  "valor": 150.00,
  "forma_pagamento": "À vista",
  "data_lancamento": "2026-05-16",
  "id_paciente": 1
}
```

### ✅ Criar Lançamento Parcelado

```json
POST /lancamentos
{
  "tipo": "DESPESA",
  "categoria": "Despesa em prestação",
  "descricao": "Aluguel consultório",
  "valor": 3000.00,
  "forma_pagamento": "Parcelado",
  "quantidade_parcelas": 3,
  "data_lancamento": "2026-05-01",
  "prestacoes": [
    {
      "numero_parcela": 1,
      "data_vencimento": "2026-05-01",
      "valor_parcela": 1000.00
    },
    {
      "numero_parcela": 2,
      "data_vencimento": "2026-06-01",
      "valor_parcela": 1000.00
    },
    {
      "numero_parcela": 3,
      "data_vencimento": "2026-07-01",
      "valor_parcela": 1000.00
    }
  ]
}
```

### ✅ Consolidação por Período

```json
GET /lancamentos/consolidado/periodo?mes=2026-05

Response:
{
  "periodo": "2026-05",
  "despesasAPagar": 3000.00,
  "receitasPrevistas": 150.00,
  "receitasRealizadas": 0.00,
  "despesasRealizadas": 0.00
}
```

---

## 🎨 Componentes React

### FormNovoLancamento
- Gerencia estado dinâmico do formulário
- Valida campos baseado no tipo/categoria
- Cria prestações dinamicamente

### CardPeriodo
- Navegação de período com botões
- Seletores dropdown para mês/ano
- Estilo gradiente

### ViewPacientes
- Grid responsivo de cards
- Agrupa lançamentos por paciente
- Calcula totais

### ViewLista
- Tabela com AntD Table
- Ordenação, paginação, ações
- Tags de status/tipo

### ViewGrid
- Grid CSS com cards altos
- Badge de parcelas
- Responsivo

---

## ⚙️ Variáveis de Ambiente

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
VITE_API_PORT=3000
```

### Backend (.env)
Configurar banco de dados MySQL conforme `src/config/config.js`

---

## 🧪 Testando Localmente

### 1. Criar um Lançamento via Terminal

```bash
curl -X POST http://localhost:3000/lancamentos \
  -H "Authorization: Bearer {seu_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "RECEITA",
    "categoria": "Receita atendimento",
    "descricao": "Teste",
    "valor": 100,
    "forma_pagamento": "À vista",
    "data_lancamento": "2026-05-16",
    "id_paciente": null
  }'
```

### 2. Listar Lançamentos

```bash
curl -H "Authorization: Bearer {seu_token}" \
  http://localhost:3000/lancamentos?mes=2026-05
```

### 3. Obter Consolidado

```bash
curl -H "Authorization: Bearer {seu_token}" \
  http://localhost:3000/lancamentos/consolidado/periodo?mes=2026-05
```

---

## ❌ Erros Comuns

### Error: "Access denied for user"
- Verifique as credenciais do MySQL em `.env`
- Certifique-se de que o MySQL está rodando

### Error: "Token não recebido"
- Realize login primeiro em `/login`
- Token é salvo em `localStorage`

### Parcelamentos não aparecendo
- Verifique se `forma_pagamento` é "Parcelado"
- Certificar-se de que `quantidade_parcelas >= 2`

### View não muda
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Verifique console (F12) para erros JavaScript

---

## 📚 Tecnologias

- **Backend**: Node.js, Express, Sequelize, MySQL
- **Frontend**: React 19, Ant Design 5, styled-components, Axios, dayjs
- **Build**: Vite, npm

---

## ✅ Checklist de Funcionalidades

Backend:
- ✅ Models Lancamento e Parcelalancamento
- ✅ Endpoints CRUD completos
- ✅ Validação de categorias por tipo
- ✅ Filtro por período (competência)
- ✅ Consolidação com somas
- ✅ Autenticação JWT
- ✅ Relacionamentos com Pacientes e Users

Frontend:
- ✅ Formulário com lógica dinâmica
- ✅ Três visualizações de dados
- ✅ Navegação de período
- ✅ Integração com API
- ✅ Gerenciamento de estado
- ✅ Estilos customizados com styled-components
- ✅ Build Vite sem erros

---

## 📞 Suporte

Para dúvidas sobre a implementação, consulte:
- Backend: `/memories/repo/kairo-project-patterns.md`
- Frontend: Documentação Ant Design (https://ant.design)
- styled-components: https://styled-components.com

---

**Implementação finalizada em:** 16 de maio de 2026
**Status:** ✅ Pronto para produção
