# Tabela de Testes Unitários do Backend

## Objetivo e convenções

Este documento orienta a implementação dos testes unitários do backend Kairo. Os testes devem usar exclusivamente o runner nativo `node:test` e o módulo `node:assert/strict`; não adicionar Supertest nem outro framework. Os arquivos em `testes/unit/` foram preparados com `test.todo(...)`: cada TODO representa trabalho ainda não implementado.

Executar a suíte a partir de `backend/`:

```sh
npm test
```

Testar a lógica de handlers/controllers chamando as funções diretamente com `req` e `res` falsos. Criar doubles para os métodos Sequelize (`findOne`, `findAll`, `create`, `update`, `destroy`, `count`, `sum`, transações), para Passport/JWT quando necessário e para serviços externos. Verificar tanto a resposta (`status`, `json`, `sendStatus`, `redirect`) quanto as chamadas/argumentos e os efeitos que não devem ocorrer nos caminhos de erro. Nos testes de rotas, usar um `app` falso que capture os handlers registrados; não iniciar servidor nem conectar ao banco.

Os resultados esperados abaixo descrevem o comportamento que os testes devem especificar. Onde indicado como risco/regressão, o código atual pode não satisfazer o requisito; não alterar a aplicação como parte desta tarefa de documentação.

## Inventário

| Arquivo de teste | Escopo |
|---|---|
| `testes/unit/auth.test.js` | Emissão de JWT, autenticação e callbacks OAuth |
| `testes/unit/users.test.js` | Cadastro, consulta e remoção de usuário |
| `testes/unit/pacientes.test.js` | Validação, CRUD, isolamento e webhook Tally |
| `testes/unit/servicos.test.js` | Schema e CRUD de serviços |
| `testes/unit/locais.test.js` | Schema, transações e CRUD de locais/endereço |
| `testes/unit/horarios.test.js` | CRUD de horários e isolamento |
| `testes/unit/public.test.js` | Perfil, disponibilidade, paciente e agendamento público |
| `testes/unit/agendamento-controller.test.js` | Criação, conflito, alteração, exclusão e indicadores |
| `testes/unit/financeiro.test.js` | Faturamento, consolidação, parcelas e fallback |
| `testes/unit/relatorios.test.js` | Prontuário, CRUD e isolamento de relatórios |
| `testes/unit/google.test.js` | OAuth, tokens e handlers do calendário Google |

O arquivo existente `testes/unit/agendamento.test.js` foi mantido sem alterações. Ele testa somente uma comparação de datas isolada e não substitui os casos abaixo.

## Casos detalhados

### Autenticação e OAuth — `auth.test.js`

| ID | Caso | Preparação e verificações |
|---|---|---|
| AUTH-01 | Login sem e-mail ou senha | Chamar o handler de `POST /token` sem cada campo, separadamente. Esperar `400` e confirmar que `Users.findOne` não foi chamado. |
| AUTH-02 | Credencial inválida | Cobrir usuário inexistente e senha incorreta. Esperar `401` com mensagem genérica; não gerar JWT. |
| AUTH-03 | Login válido | Simular senha correta. Esperar token e conferir payload decodificado: `id_usuario`, nome e expiração de 24 horas. |
| AUTH-04 | Estratégia JWT rejeita payload sem usuário | Exercitar callback da estratégia com `id_usuario` ausente e usuário não encontrado; deve rejeitar a autenticação. |
| AUTH-05 | Falha no callback OAuth | Sem `req.user`, o controller de sucesso retorna `401`; o callback de falha retorna `401` e `success: false`. |
| AUTH-06 | Callback de login Google | Com usuário autenticado, conferir redirecionamento com token e nome codificados. |
| AUTH-07 | Callback de vínculo Google | Com `state` iniciado por `vinculo_`, conferir redirecionamento de vínculo mesmo quando Passport informa falha, conforme comportamento implementado. |

### Usuários — `users.test.js`

| ID | Caso | Preparação e verificações |
|---|---|---|
| USER-01 | Cadastro incompleto | Omitir nome, e-mail e senha, um campo por vez. Esperar `400`; `Users.create` não deve ser chamado. |
| USER-02 | Cadastro válido e valores padrão | Omitir `tipo_usuario` e `ativo`. Esperar `201`; verificar defaults `paciente` e `true`, e que `reload()` é chamado antes da resposta. |
| USER-03 | Consulta do usuário autenticado | Simular encontrado e ausente em `GET /user`. Conferir busca pelo ID do token e a lista permitida de atributos; esperar `404` quando ausente. |
| USER-04 | Exclusão do usuário autenticado | Conferir que `DELETE /user` usa somente o ID de `req.user` e responde `204`; cobrir também erro do model. |

### Pacientes — `pacientes.test.js`

| ID | Caso | Preparação e verificações |
|---|---|---|
| PAC-01 | Validação de paciente | Cobrir nome/e-mail ausentes, e-mail inválido, CPF inválido, CEP inválido e RG fora do formato. Esperar `400` com campos correspondentes. |
| PAC-02 | Normalização e dados opcionais | Verificar strings vazias convertidas para `null`, UF em maiúsculas e dados opcionais aceitos; CPF/CEP válidos permanecem aceitos. |
| PAC-03 | Atualização parcial | Para `PUT`/`PATCH`, enviar apenas um campo e confirmar que o schema parcial não exige nome e e-mail. Para criação, campos obrigatórios continuam exigidos. |
| PAC-04 | Webhook Tally inválido ou sem profissional | Payload sem `data.fields` retorna `400`; payload mapeado sem `usuarioId`/`id_usuario` também retorna `400`; não criar paciente. |
| PAC-05 | Webhook mapeia campos e consulta CEP | Simular campos Tally (incluindo opções dropdown e telefone com DDI). Conferir os dados normalizados e endereço preenchido quando o lookup do CEP funciona. |
| PAC-06 | Falha no serviço de CEP | Fazer o lookup rejeitar. O cadastro deve prosseguir com os dados já recebidos, sem endereço inventado. |
| PAC-07 | CRUD privado e isolamento por usuário | Para listagem, criação, busca, edição e exclusão, conferir `id_usuario` vindo de `req.user`; paciente pertencente a outro usuário deve ser tratado como ausente (`404`) e nunca alterado/excluído. |
| PAC-08 | Busca por nome, busca parcial e contagem | Busca parcial sem `nome` retorna `400`; busca exata/parcial e contagem devem incluir o ID do usuário autenticado no filtro. |

### Serviços — `servicos.test.js`

| ID | Caso | Preparação e verificações |
|---|---|---|
| SERV-01 | Schema de criação | Nome curto/longo e modalidade inválida retornam erro; modalidade e `ativo` assumem defaults quando omitidos. |
| SERV-02 | Schema de atualização | Atualização parcial válida passa; nome/modalidade inválidos falham; campos omitidos não são adicionados ao resultado. |
| SERV-03 | Listagem e filtro ativo | `GET /servicos` limita por usuário, ordena por nome e converte `ativo=true/false` em booleano. |
| SERV-04 | Criação vinculada ao usuário | Com payload válido, `POST /servicos` define `id_usuario` pelo usuário autenticado e retorna `201`; erro de validação Sequelize retorna `412`. |
| SERV-05 | Consulta, atualização e remoção | Recurso inexistente ou de outro usuário retorna `404`; update/remove devem filtrar conjuntamente por ID e usuário. |

### Locais — `locais.test.js`

| ID | Caso | Preparação e verificações |
|---|---|---|
| LOCAL-01 | Schema do endereço/local | Local presencial sem endereço, CEP inválido, número ausente e campos obrigatórios inválidos falham; local de vídeo pode não ter endereço. |
| LOCAL-02 | Criar local presencial | Simular criação de endereço e local na mesma transação. Conferir IDs, defaults, commit e leitura final com associação. |
| LOCAL-03 | Criar local de vídeo | Não criar endereço; criar local com `is_video: true` e `id_endereco: null`; confirmar commit. |
| LOCAL-04 | Atualizar endereço/local | Cobrir atualização de endereço existente, criação de endereço quando não havia um e conversão para vídeo removendo o endereço anterior. |
| LOCAL-05 | Falha ou local ausente na atualização | Falha no model provoca rollback e resposta de erro; ID inexistente provoca rollback e `404`. |
| LOCAL-06 | Excluir local | Excluir local e endereço vinculado na mesma transação; local ausente retorna `404`; falha em qualquer operação executa rollback. |

### Horários — `horarios.test.js`

| ID | Caso | Preparação e verificações |
|---|---|---|
| HOR-01 | Listagem de horários | Conferir escopo por usuário, inclusão opcional do local/endereço e ordenação por dia e hora. |
| HOR-02 | Criar horário | Conferir atribuição de `id_usuario`, resposta `201` e releitura com associação de local; erros de validação Sequelize retornam `412`. |
| HOR-03 | Consultar horário por ID | Registro do usuário responde com dados; ausente ou pertencente a outro usuário responde `404`. |
| HOR-04 | Atualizar horário | Remover `id_usuario` enviado no body antes de atualizar; filtro usa ID e usuário; zero linhas atualizadas retorna `404`. |
| HOR-05 | Excluir horário | Filtro usa ID e usuário; zero linhas removidas retorna `404`, caso removido retorna `204`. |

### Rotas públicas — `public.test.js`

| ID | Caso | Preparação e verificações |
|---|---|---|
| PUB-01 | Perfil por slug | Slug desconhecido retorna `404`; slug válido retorna profissional e somente serviços, locais e horários ativos, associados ao profissional. |
| PUB-02 | Parâmetro de data e profissional | Disponibilidade sem `data` retorna `400`; slug sem profissional retorna `404`. |
| PUB-03 | Sem expediente configurado | Com profissional válido e nenhum horário ativo para o dia da semana, retornar sucesso com lista vazia. |
| PUB-04 | Geração de slots | Expediente de várias horas gera slots consecutivos de 60 minutos; não gerar slot que ultrapasse o fim do expediente. Conferir dia da semana. |
| PUB-05 | Filtragem de slots ocupados | Horários não cancelados removem seus slots; cancelados não removem. Cobrir data-hora armazenada como string e como `Date`. |
| PUB-06 | Verificar paciente público | Campos ausentes retornam `400`; e-mail é aparado e convertido para minúsculas; conferir respostas para paciente existente e inexistente. |
| PUB-07 | Agendamento público com dados incompletos | Ausência de usuário, paciente, data ou hora retorna `400`; não chamar `Agendamentos.create`. |
| PUB-08 | Agendamento público válido e virada de hora | Conferir data/hora de início e fim (uma hora depois), valores opcionais nulos e status `agendado`; incluir caso perto da meia-noite. |
| PUB-09 | Regressão: autorização e conflito no agendamento público | Esperado: validar que o paciente pertence ao profissional e que o horário segue disponível antes de criar. O código atual não faz essas verificações; registrar como teste de requisito que deverá falhar até correção da aplicação. |

### Agendamentos — `agendamento-controller.test.js`

| ID | Caso | Preparação e verificações |
|---|---|---|
| AG-01 | Criação sem campos obrigatórios | Omitir paciente/início/fim individualmente; esperar `400` e garantir que models/Google não sejam chamados. |
| AG-02 | Paciente ausente ou de outro usuário | `Pacientes.findOne` não encontra paciente no escopo do usuário; esperar `404` e não criar agendamento. |
| AG-03 | Criação sem conflito | Com paciente do usuário e sem sobreposição, conferir dados/defaults de `create`; sem evento Google, responder com `sincronizadoGoogle: false`. |
| AG-04 | Conflitos de horário | Cobrir início dentro do intervalo existente, fim dentro do intervalo e agendamento existente que contém todo o novo; esperar `409` sem criar. |
| AG-05 | Sincronização Google na criação | Evento Google com ID atualiza `google_event_id` e marca sucesso; ausência de token/evento mantém criação e indica não sincronizado. |
| AG-06 | Listagem e indicadores | Conferir filtros por usuário/paciente, ordenações e contagem de concluídos entre início inclusivo e próximo mês exclusivo. |
| AG-07 | Consulta e alteração de agendamento | Registro ausente/alheio retorna `404`; alteração não deve conflitar consigo mesma; conflito com outro registro retorna `409`. |
| AG-08 | Atualização parcial e Google | Conferir que só campos enviados são alterados, IDs de local/serviço são convertidos ou anulados e evento vinculado recebe os dados atualizados. |
| AG-09 | Exclusão e Google | Registro ausente retorna `404`; sem evento remove somente o registro; com evento remove Google antes do registro. Cobrir falha externa e resposta de erro. |
| AG-10 | Intervalo inválido | Testar `fim <= início` chamando a lógica real de criação/atualização. Esperado: rejeitar antes de consultar/criar conflito; o código atual não contém validação explícita. |

### Financeiro — `financeiro.test.js`

| ID | Caso | Preparação e verificações |
|---|---|---|
| FIN-01 | Faturamento para mês informado | Para `YYYY-MM`, conferir limites de início/fim do mês e do mês anterior, filtros de usuário, receita e status pago. |
| FIN-02 | Faturamento sem mês ou mês malformado | Usar mês corrente quando parâmetro não tem formato válido; conferir período retornado e cálculos. |
| FIN-03 | Faturamento sem dados/erro de soma | `null`, `undefined`, valor não numérico ou erro no `sum` resulta em zero para aquela soma. |
| FIN-04 | Variação percentual | Conferir crescimento/queda normal, mês anterior igual a zero e ambos os meses zerados; arredondamento a duas casas. |
| FIN-05 | Gráfico histórico | Garantir seis meses no resultado, acumulando receita/despesa no mês correto e ignorando item sem data ou fora da janela. |
| FIN-06 | Lançamentos em aberto e fallback | Limite ausente/inválido assume 5; falha na associação repete busca sem include; ausência do model retorna erro de servidor. |
| FIN-07 | Consolidado por período | Cobrir despesas/receitas pendentes e pagas; conferir filtro opcional de mês e soma nula/erro convertida em zero. |
| FIN-08 | Listagem de lançamentos | Conferir filtro de mês e usuário; falha de include aciona fallback sem associações; model ausente retorna `500`. |
| FIN-09 | Criar lançamento e parcelas | Forma parcelada usa `bulkCreate`; à vista cria uma parcela; conferir status pendente, datas, usuário e fallback de leitura final. |
| FIN-10 | Consultar/atualizar/excluir lançamento | Outro usuário/ID ausente retorna `404`; pagamento parcelado marca somente parcelas vencidas até a data; exclusão remove parcelas e lançamento. |

### Relatórios e prontuário — `relatorios.test.js`

| ID | Caso | Preparação e verificações |
|---|---|---|
| REL-01 | Prontuário por paciente | Conferir filtro por paciente e usuário autenticado, includes opcionais e ordenação decrescente por criação. |
| REL-02 | Criar relatório sem conteúdo | Retorna `400`; não cria relatório nem atualiza agendamento. |
| REL-03 | Criar relatório associado | Agendamento ausente/alheio retorna `404`; válido cria com usuário, tipo default `sessao` e marca agendamento como concluído. |
| REL-04 | Atualizar relatório | ID ausente/alheio retorna `404`; campos omitidos permanecem inalterados e campos enviados são salvos. |
| REL-05 | Excluir relatório e anexos | ID ausente/alheio retorna `404`; quando anexos existem, excluí-los antes de remover relatório; sem model de anexos, ainda remover relatório. |

### Google Calendar e OAuth — `google.test.js`

| ID | Caso | Preparação e verificações |
|---|---|---|
| GOOGLE-01 | Logout sem ID ou usuário ausente | Sem ID retorna `400`; usuário inexistente retorna `404`; não salvar alterações. |
| GOOGLE-02 | Logout válido e consulta de tokens | Logout limpa tokens e salva; consulta retorna `404` para usuário ausente e `400` para usuário sem `google_id`. |
| GOOGLE-03 | Consulta de tokens vinculados | Retornar campos esperados sem expor outros atributos do usuário. |
| GOOGLE-04 | Calendário: validação de criação/alteração | Criação sem campos obrigatórios ou update sem usuário retorna `400`; serviço Google não deve ser chamado. |
| GOOGLE-05 | Calendário: listagem e opções | Converter `maxResults`, incluir `timeMin/timeMax` somente quando fornecidos e refletir total/lista na resposta. |
| GOOGLE-06 | Calendário: chamadas do serviço | Conferir argumentos de criação, atualização parcial e exclusão; falha externa resulta em `500`. |
| GOOGLE-07 | Serviço Google sem credenciais | Sem usuário/token, criação de evento de agenda retorna `null`; demais operações rejeitam com erro de autenticação Google. |
| GOOGLE-08 | Isolamento entre usuários | Requisito de segurança: usuário autenticado não deve ler tokens nem criar/alterar/excluir eventos de outro usuário. As rotas atuais recebem IDs de body/query/params e podem não impor esse vínculo; o teste deve evidenciar a lacuna. |
| GOOGLE-09 | Registro duplicado das rotas OAuth | Usar app falso para capturar registros de `auth.js` e `googleAuth.js`; documentar os handlers duplicados de `/auth/google` e `/auth/google/callback` e determinar qual registro prevalece no carregamento atual. |

## Observações para quem implementar

- Manter os testes determinísticos: congelar ou injetar a data/hora nos casos de hoje, mês corrente, mês anterior, gráfico e expiração de JWT.
- Os testes de segurança devem afirmar a ausência de chamadas de escrita/leitura fora do escopo, além do status retornado.
- Para funções registradas como callbacks de rota, criar um `app` falso mínimo que registre método, caminho e handler. Isso permite testar a lógica sem abrir porta HTTP.
- Não chamar `boot.js` nos testes: ele autentica e sincroniza o banco, cria trigger e inicia o servidor.
- Casos marcados como requisito/regressão podem falhar com a implementação atual. Registrar o comportamento observado e reportar a lacuna; não mascarar o teste para fazê-lo passar.