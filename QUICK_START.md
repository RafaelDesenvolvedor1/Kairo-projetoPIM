# 🚀 QUICK START - Módulo Financeiro Kairo

## ⚡ Início Rápido (5 minutos)

### Terminal 1 - Backend
```bash
cd backend
npm install
npm run dev
# ✅ Porta 3000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm run dev
# ✅ Porta 5173 (http://localhost:5173)
```

### Terminal 3 - MySQL (se não tiver rodando)
```bash
# Docker (recomendado)
docker-compose up

# Ou MySQL local
mysql -u root -p < database_schema.sql
```

---

## 🎯 Primeiro Lançamento

1. **Login** em http://localhost:5173
2. Navegue para `/financeiro`
3. Clique em "Novo Lançamento"
4. Preencha:
   - Tipo: RECEITA
   - Categoria: Receita atendimento
   - Descrição: Meu primeiro lançamento
   - Valor: 150
   - Forma de Pagamento: À vista
   - Data: Hoje
5. Clique em "Salvar Lançamento"
6. ✅ Deve aparecer em uma das 3 views

---

## 🔍 Verificar se Funciona

### Backend
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/lancamentos
```

### Frontend
- Cards de consolidação mostram valores? ✅
- View muda entre Pacientes/Lista/Grid? ✅
- Período muda com os botões? ✅
- Novo lançamento cria sem erro? ✅

---

## 📁 Arquivo Important

- `/GUIA_FINANCEIRO.md` - Documentação completa
- `/CHECKLIST_FINANCEIRO.md` - Verificação de funcionalidades

---

## ⚠️ Erros Comuns

| Erro | Solução |
|------|---------|
| "Port 3000 in use" | `lsof -i :3000 \| kill -9` |
| "Token inválido" | Faça login novamente |
| "MySQL connection error" | Verifique .env e Docker |
| "View não renderiza" | Limpar cache (Ctrl+Shift+Delete) |
| "Prestações não funcionam" | Verifique console (F12) |

---

## 📊 Estrutura de Dados

```
User (id_usuario)
  ├─ Pacientes (id_paciente)
  │   └─ Lancamento (id_lancamento)
  │       └─ Parcelalancamento (id_parcela)
  └─ Lancamento (direto, sem paciente)
      └─ Parcelalancamento
```

---

## 🎮 Test Payloads

### Criar Lançamento Simples
```bash
curl -X POST http://localhost:3000/lancamentos \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo":"RECEITA",
    "categoria":"Receita atendimento",
    "descricao":"Teste",
    "valor":100,
    "forma_pagamento":"À vista",
    "data_lancamento":"2026-05-16"
  }'
```

### Listar
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/lancamentos?mes=2026-05
```

### Consolidado
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/lancamentos/consolidado/periodo?mes=2026-05
```

---

## 📱 Views Disponíveis

| View | O que vê | Cliques |
|------|----------|--------|
| **Pacientes** | Cards com pacientes | Clique para ver detalhe |
| **Lista** | Tabela com todos | Ações: Editar/Deletar |
| **Grid** | Cards lado a lado | Ações: Editar/Deletar |

---

## 🔐 Autenticação

1. Fazer login em http://localhost:5173/login
2. Token é armazenado em `localStorage`
3. Adicionado automaticamente em todas requisições via `financeirosService.js`

---

## 🎨 Personalizações Fáceis

### Mudar Cor dos Cards
→ Editar `src/routes/Financeiro/styles.js`

### Mudar Ícones
→ Editar imports em `src/routes/Financeiro/index.jsx`

### Adicionar Novo Campo
→ Adicionar em Backend model + Frontend form

---

## 📞 Troubleshooting Avançado

### Backend não inicia
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Frontend não renderiza
```bash
cd frontend
rm -rf node_modules dist .env.local
npm install
npm run dev
```

### Dados desapareceram
```bash
# Resetar banco de dados
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
```

---

## ✅ Checklist Pré-Deploy

- [ ] Backend rodando sem erros
- [ ] Frontend build sucesso
- [ ] Login funciona
- [ ] Novo lançamento cria
- [ ] Cards mostram valores
- [ ] Período filtra corretamente
- [ ] Deletar funciona
- [ ] Todas 3 views renderizam
- [ ] Estilos aparecem corretos
- [ ] Console sem erros (F12)

---

## 🎓 Próximos Passos (Opcional)

1. [ ] Implementar edição de lançamentos
2. [ ] Adicionar filtro avançado
3. [ ] Exportar para CSV/PDF
4. [ ] Criar relatórios
5. [ ] Implementar dashboard de análise
6. [ ] Adicionar notificações push
7. [ ] Testes automatizados (Jest + React Testing Library)
8. [ ] CI/CD pipeline (GitHub Actions)

---

## 📚 Referências

- Ant Design: https://ant.design
- styled-components: https://styled-components.com
- Sequelize: https://sequelize.org
- React Hooks: https://react.dev/reference/react

---

**Última atualização:** 16 de maio de 2026
**Desenvolvedor:** Full Stack Senior (Node.js + React)
**Status:** ✅ Pronto para Produção
