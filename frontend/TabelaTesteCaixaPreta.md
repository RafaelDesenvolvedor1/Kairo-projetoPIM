# Roteiro de Testes Manuais de Caixa-Preta - Frontend Kairo

## 1. Objetivo

Este documento orienta a execução manual de testes pela interface do frontend. Não são necessários testes automatizados, arquivos de código, Cypress ou alterações no backend. Os casos verificam o comportamento visível para a pessoa usuária, incluindo navegação, validações, mensagens, atualização de dados e integração com a API.

## 2. Como executar e registrar

Executar os casos em um navegador atualizado, com frontend e backend em execução e conexão com o banco disponível. Usar uma conta de teste própria e não utilizar dados reais de pacientes. Registrar para cada caso: ID, data/hora, navegador, resultado (Aprovado, Reprovado, Bloqueado ou Não implementado), evidência (captura de tela/vídeo), mensagem exibida e observações.

A menos que o caso diga o contrário, considerar aprovado quando a interface responder conforme esperado, mostrar feedback coerente e manter os dados corretos após atualizar a página ou sair e entrar novamente. Erro de API deve ser registrado como Bloqueado se o ambiente estiver indisponível; se a interface não tratar um erro reproduzível com o backend operacional, registrar como Reprovado.

## 3. Preparação e dados de teste

Preparar antes da execução:

- Conta profissional de teste com credenciais conhecidas e página pública configurada (slug disponível).
- Segunda conta profissional, para conferir que dados privados não se misturam entre contas.
- Pacientes de teste: um paciente mínimo, um com perfil completo e um paciente cujo e-mail já esteja cadastrado para o profissional.
- Serviço ativo e inativo; local presencial com endereço válido e local online; horários de atendimento para pelo menos dois dias da semana.
- Agendamentos futuros e passados, incluindo status agendado, concluído e cancelado.
- Lançamentos financeiros de receita/despesa, pagos/pendentes, à vista/parcelados, associados e não associados a paciente.
- Para cadastro público de paciente, acesso ao formulário Tally configurado. Para CEP, conexão ao serviço externo.

Use dados fictícios consistentes, por exemplo nome `Paciente Teste`, e-mail `qa+paciente@exemplo.com`, telefone com DDD, CPF de teste válido apenas se o formulário exigir. Não reutilizar informação pessoal real. Ao terminar, remover os dados de teste quando permitido.

## 4. Tabela de casos

### Autenticação, sessão e navegação

| ID | Prioridade | Pré-condição | Passos manuais | Resultado esperado / validação |
|---|---|---|---|---|
| UI-AUTH-01 | P0 | Sem sessão autenticada | Abrir diretamente `/`, `/pacientes`, `/pacientes/dates`, `/financeiro`, `/agendamentos`, `/locais`, `/servicos` e `/horarios`. | Cada rota interna direciona para `/login`; conteúdo privado não fica visível. |
| UI-AUTH-02 | P0 | Conta válida | Fazer login com e-mail e senha corretos. | Mensagem de sucesso, redirecionamento para Home e sessão mantida ao recarregar. |
| UI-AUTH-03 | P0 | Na tela Login | Enviar formulário vazio e depois testar senha incorreta/e-mail não cadastrado. | Campos obrigatórios são sinalizados; credencial inválida apresenta erro compreensível sem abrir área privada. |
| UI-AUTH-04 | P1 | Na tela Login | Usar link “Cadastrar” e retornar pelo link “Já tenho conta”. | Navegação entre `/login` e `/cadastro` funciona. |
| UI-AUTH-05 | P1 | Na tela Cadastro | Tentar envio vazio, e-mail malformado, senhas diferentes e cadastro válido. | Obrigatoriedade/formato validados; senha diferente exibe erro e não cadastra; cadastro válido confirma e leva ao login. |
| UI-AUTH-06 | P0 | Sessão autenticada | Acionar sair pelo menu de usuário; depois usar voltar do navegador e recarregar uma rota privada. | Token/sessão removido e acesso privado redirecionado ao login. |
| UI-NAV-01 | P1 | Sessão autenticada | Navegar pelo menu lateral entre Home, Pacientes, Agenda, Financeiro e configurações. Recolher e expandir o menu. | Cada item abre a tela correspondente, item atual fica selecionado e o layout continua utilizável. |
| UI-NAV-02 | P1 | Navegador com largura desktop e mobile/tablet | Abrir páginas principais, recolher menu e percorrer conteúdo horizontal/vertical. | Textos, campos, botões e diálogos permanecem acessíveis, sem sobreposição ou corte que impeça concluir ações. |

### Home e compartilhamento

| ID | Prioridade | Pré-condição | Passos manuais | Resultado esperado / validação |
|---|---|---|---|---|
| UI-HOME-01 | P1 | Usuário autenticado com dados | Abrir Home e aguardar carregamento. | Nome do usuário, consultas do dia, totais do mês atual/anterior, faturamento, gráfico e lançamentos pendentes refletem os dados cadastrados. |
| UI-HOME-02 | P1 | Conta sem dados | Abrir Home sem agendamentos nem lançamentos. | Carregamento termina; estados vazios aparecem sem erro visual ou conteúdo incorreto. |
| UI-HOME-03 | P1 | Home carregada e slug configurado | Usar “Copiar Link” e “Ver Página” no bloco de página pública. | Link copiado corresponde à URL `/p/{slug}` do usuário; abrir página leva ao perfil correto. |
| UI-HOME-04 | P2 | Falha de uma chamada de dashboard reproduzível | Indisponibilizar temporariamente um endpoint em ambiente de teste e abrir Home. | Tela não quebra; itens indisponíveis permanecem em estado seguro e carregamento encerra. Registrar valores incorretos ou spinner permanente. |

### Pacientes e perfil

| ID | Prioridade | Pré-condição | Passos manuais | Resultado esperado / validação |
|---|---|---|---|---|
| UI-PAC-01 | P0 | Conta autenticada | Abrir Pacientes; alternar grade/lista; conferir estado com e sem dados. | Pacientes aparecem com nome/contato; estado vazio oferece ação de cadastro; alternância não perde dados. |
| UI-PAC-02 | P0 | Lista de pacientes | Abrir adicionar paciente; enviar vazio, nome com menos de 3 caracteres, e-mail inválido, telefone com letras ou telefone fora do tamanho permitido. | Formulário mostra validações; não cria registro inválido. Telefone é opcional e deve aceitar formato DDD + 10/11 dígitos. |
| UI-PAC-03 | P0 | Lista de pacientes | Criar paciente com nome, e-mail válido e telefone opcional; fechar e recarregar a tela. | Confirmação de sucesso, drawer fecha, paciente aparece uma única vez e permanece após recarga. |
| UI-PAC-04 | P1 | Paciente existente | Abrir edição do paciente, alterar dados e salvar; reabrir a edição. | Alterações aparecem nos detalhes e continuam persistidas; cancelar/fechar sem salvar não deve confirmar alteração. |
| UI-PAC-05 | P1 | Paciente existente | Excluir paciente e confirmar; repetir com cancelamento da confirmação. | Confirmar remove o paciente da lista; cancelar preserva o registro. |
| UI-PAC-06 | P1 | Conta autenticada com ID disponível | Copiar/enviar formulário de cadastro público de paciente. | Feedback de cópia aparece e o link inclui identificador do profissional; ao abrir, formulário deve apontar ao profissional correto. |
| UI-PAC-07 | P1 | Paciente com perfil aberto | Navegar para Perfil e editar CPF, RG, CEP, nascimento e contatos. Testar CPF inválido e válido; testar busca de CEP. | CPF inválido é sinalizado; dados válidos persistem; CEP válido preenche endereço quando o serviço responde; falha externa informa erro sem travar edição. |
| UI-PAC-08 | P1 | Paciente selecionado | Abrir atalhos Perfil, Instrumentos, Prontuário, Anotações, Agenda, Financeiro, Diário, Documentos e Anexos. | Perfil/Prontuário/Anotações/Agenda/Financeiro mostram o paciente selecionado. Abas declaradas “Em breve” devem ser registradas como não implementadas, não como fluxo concluído. |

### Agenda

| ID | Prioridade | Pré-condição | Passos manuais | Resultado esperado / validação |
|---|---|---|---|---|
| UI-AG-01 | P0 | Paciente e serviço/local cadastrados | Abrir Agenda, selecionar uma data, abrir criação e inspecionar seletores. | Pacientes e serviços carregam; locais inativos não aparecem; data escolhida fica associada ao formulário. |
| UI-AG-02 | P0 | Agenda aberta | Tentar salvar sem paciente e sem horário; depois criar consulta válida com paciente, horário e opcionais. | Campos obrigatórios são indicados; sucesso mostra mensagem, fecha drawer e adiciona evento na data e hora certas. |
| UI-AG-03 | P0 | Existe consulta no período | Criar outra consulta sobreposta, incluindo início dentro da existente e intervalo que a contém. | Interface apresenta conflito e não cria segundo registro. Registrar também se consultas consecutivas (fim igual ao início) são aceitas ou rejeitadas conforme regra definida pelo produto. |
| UI-AG-04 | P1 | Consulta existente | Clicar na consulta, alterar hora/status/observações e salvar; testar cancelar edição. | Modal preenche valores atuais; salvar reflete alteração no calendário; cancelar não persiste mudanças. Horário mostrado deve manter o mesmo fuso e minuto. |
| UI-AG-05 | P1 | Consulta existente | Alterar status entre agendado, concluído e cancelado. | Cor/indicador e status visível correspondem ao selecionado e continuam após recarga. |
| UI-AG-06 | P1 | Conta conectada ao Google Calendar | Criar, editar e excluir consulta sincronizada. Repetir sem conta Google conectada. | Com integração disponível, feedback indica sincronização; sem integração, consulta continua operável e a interface não reporta sincronização falsa. |
| UI-AG-07 | P1 | Consulta exibida na aba Agenda do paciente | Marcar como atendido, cancelar, editar data/intervalo e excluir. | Status é atualizado; ações incompatíveis ficam desabilitadas para concluído/cancelado; reagendamento recarrega a lista; excluir exige confirmação. |

### Locais, serviços e horários

| ID | Prioridade | Pré-condição | Passos manuais | Resultado esperado / validação |
|---|---|---|---|---|
| UI-CONF-01 | P0 | Sessão autenticada | Criar local presencial sem nome, sem CEP, número ou logradouro; depois preencher endereço incorreto e correto. | Campos obrigatórios impedem envio; CEP inválido é indicado; CEP reconhecido preenche logradouro/bairro/cidade/UF; local válido aparece na lista com endereço formatado. |
| UI-CONF-02 | P1 | Tela Locais | Criar local online e alternar atendimento online durante edição de local presencial. | Ao ativar atendimento online, campos físicos deixam de ser exigidos; card identifica atendimento online; ao salvar, dados antigos de endereço não devem ser apresentados como endereço atual. |
| UI-CONF-03 | P1 | Local existente | Editar nome/endereço/ativo, cancelar exclusão e confirmar exclusão. | Edição persiste; status ativo muda; cancelamento preserva; confirmação remove. Local inativo não deve aparecer em seletor de agendamento. |
| UI-CONF-04 | P0 | Tela Serviços | Tentar salvar vazio, nome abaixo de 3 caracteres e nome acima de 100; salvar serviço válido para cada modalidade. | Validações bloqueiam inválidos; serviço válido aparece com nome/modalidade e persiste após recarga. |
| UI-CONF-05 | P1 | Serviço existente | Editar serviço, ativar/desativar e testar excluir com confirmação cancelada e confirmada. | Alteração/status aparecem corretamente; serviço inativo não deve ser oferecido no perfil público; excluir só remove quando confirmado. |
| UI-CONF-06 | P0 | Ao menos um local cadastrado | Em Horários, tentar salvar sem período/local; criar intervalo válido para dia e local. | Obrigatoriedade de período/local é clara; horário válido aparece no dia escolhido associado ao local. |
| UI-CONF-07 | P1 | Horário cadastrado | Editar horário e local; excluir cancelando e confirmando. | Dados atuais carregam no formulário; edição persiste; cancelamento preserva; confirmação remove e lista é atualizada. |

### Financeiro

| ID | Prioridade | Pré-condição | Passos manuais | Resultado esperado / validação |
|---|---|---|---|---|
| UI-FIN-01 | P0 | Conta com lançamentos em meses distintos | Abrir Financeiro e alternar período para outro mês. | Cards de resumo e lista correspondem ao período selecionado; meses sem lançamentos mostram valores zero/estado vazio coerentes. |
| UI-FIN-02 | P0 | Financeiro aberto | Criar receita à vista com categoria, valor e data; repetir para despesa fixa e despesa em prestação. | Campos de categoria se ajustam ao tipo; data/valor obrigatórios; lançamento aparece com tipo, categoria, valor e status pendente. |
| UI-FIN-03 | P0 | Financeiro aberto | Criar lançamento parcelado, incluir/remover parcelas, deixar uma parcela sem data/valor e tentar salvar; preencher todas e salvar. | Parcela incompleta bloqueia envio com mensagem; soma total corresponde às parcelas; quantidade e vencimentos exibidos são consistentes. |
| UI-FIN-04 | P1 | Lançamentos presentes | Alternar Lista/Grid/Pacientes e usar filtros por receita/despesa e pago/pendente; limpar filtros. | Visões representam os mesmos registros; filtros podem ser combinados e limpar restaura todos. |
| UI-FIN-05 | P1 | Lançamento pendente | Marcar receita como recebida e despesa como paga; reverter status e atualizar tela. | Status e resumos mudam; lançamento pago deixa de permitir edição; reversão devolve para pendente se disponível. |
| UI-FIN-06 | P1 | Lançamento pendente e pago | Editar pendente; tentar editar pago; excluir e cancelar/confirmar diálogo. | Pendente pode ser editado; pago exibe aviso e não abre edição; cancelamento preserva; confirmação remove e atualiza totais. |
| UI-FIN-07 | P1 | Lançamento para teste | Anexar comprovante em formato suportado e em arquivo inválido/grande; observar confirmação e recarregar. | Upload válido confirma e permanece associado; erro apresenta mensagem e não deixa estado de carregamento permanente. |
| UI-FIN-08 | P2 | Financeiro com dados | Acionar exportação “Baixar CSV”. | Verificar se há download e se conteúdo/colunas correspondem aos filtros; se o botão não fizer nada, registrar como lacuna da interface. |
| UI-FIN-09 | P2 | Receita pendente | Acionar ícone “Cobrança”. | Verificar existência de ação observável. Se só não houver efeito ou abrir apenas log de console, registrar como não implementado/defeito de UX. |
| UI-FIN-10 | P1 | Lançamentos associados a pacientes | Abrir visualização Pacientes e selecionar paciente; abrir aba Financeiro desse paciente. | Valores exibidos correspondem somente ao paciente selecionado; limpar/trocar paciente atualiza os registros. |

### Prontuário e anotações

| ID | Prioridade | Pré-condição | Passos manuais | Resultado esperado / validação |
|---|---|---|---|---|
| UI-PRONT-01 | P0 | Paciente existente | Abrir aba Prontuário, editar, inserir texto e usar negrito, itálico, alinhamento e listas; salvar e sair/voltar. | Conteúdo formatado persiste e é exibido corretamente após recarga; botão expandir permite editar/salvar e fechar sem salvar descarta a edição. |
| UI-PRONT-02 | P1 | Paciente existente | Criar anotação avulsa com texto formatado e salvar; depois editar e cancelar. | Nova nota aparece na timeline com origem Avulso; edição persiste somente após salvar. |
| UI-PRONT-03 | P1 | Paciente com consultas e notas | Criar anotação associada a consulta e verificar timeline. Filtrar por serviço, origem e termo; limpar filtros. | Nota fica vinculada à consulta, aparece como Via Agenda e filtros restringem resultados; limpar restaura a lista. |
| UI-PRONT-04 | P1 | Nota existente | Excluir nota, cancelar confirmação e depois confirmar. | Cancelamento preserva; confirmação remove da timeline sem apagar outra nota. |
| UI-PRONT-05 | P2 | Aba Anotações ou Prontuário aberta | Acionar controles de anexar arquivo e procurar retorno visual. | Registrar se upload realmente abre seletor, envia arquivo e o mostra depois; ausência de ação indica controle não implementado. |
| UI-PRONT-06 | P1 | Entrar em `/pacientes/dates` por acesso direto, sem navegar a partir de paciente | Observar cabeçalho e abas Perfil, Agenda, Financeiro e Prontuário. | Deve apresentar estado vazio/erro amigável, não travar nem exibir dados de outro paciente. Navegação a partir de paciente válido deve manter o paciente correto. |

### Página pública de agendamento

| ID | Prioridade | Pré-condição | Passos manuais | Resultado esperado / validação |
|---|---|---|---|---|
| UI-PUB-01 | P0 | Slug público válido | Abrir link em janela anônima sem sessão. | Página pública abre sem login e apresenta nome, serviços, locais e disponibilidade semanal ativos do profissional correto. |
| UI-PUB-02 | P1 | Slug inexistente ou perfil sem cadastro | Abrir `/p/slug-inexistente`; repetir com profissional sem serviço/local/horário. | Exibe profissional não encontrado ou estados vazios claros; página não quebra. |
| UI-PUB-03 | P0 | Perfil com expediente configurado | Iniciar agendamento, tentar avançar sem data/horário, selecionar data passada e data futura com vagas/sem vagas. | Não permite data passada; botão Avançar fica desabilitado sem data/slot; slots livres são apresentados e dia sem disponibilidade informa claramente. |
| UI-PUB-04 | P0 | Perfil com slots livres | Selecionar serviço, data e horário; informar e-mail vazio/malformado e depois e-mail de paciente existente. | Serviço/data/hora ficam claros; e-mail inválido exibe aviso; paciente existente segue para confirmação identificando o paciente correto. |
| UI-PUB-05 | P0 | E-mail não cadastrado no profissional | Informar e-mail válido ainda não cadastrado. | Abre Tally em modal ou nova aba com `usuario_id`, serviço, data, hora e e-mail preenchidos; retorno/fechamento não deve confirmar agendamento fictício. |
| UI-PUB-06 | P0 | Paciente recorrente identificado | Confirmar agendamento e verificar resposta visual e agenda do profissional. | Sucesso informa paciente/data/hora e novo agendamento aparece na agenda. Repetir tentativa no mesmo slot para verificar que a vaga não é duplicada. |
| UI-PUB-07 | P1 | Fluxo de agendamento aberto | Usar Voltar, Alterar e-mail e fechar modal em cada etapa; abrir novo agendamento. | Etapas voltam sem manter seleção indevida; fechar e reabrir limpa data, hora, e-mail e paciente anterior. |
| UI-PUB-08 | P1 | Perfil com serviço/local ativos e inativos | Comparar conteúdo público antes/depois de desativar serviço ou local na área interna. | Somente serviços/locais ativos aparecem para pacientes; mudanças refletem após atualizar página. |

### Resiliência e segurança observáveis

| ID | Prioridade | Pré-condição | Passos manuais | Resultado esperado / validação |
|---|---|---|---|---|
| UI-SEC-01 | P0 | Duas contas profissionais com dados diferentes | Entrar como A e anotar dados; sair, entrar como B e visitar Home, pacientes, agenda e financeiro. | B vê apenas os próprios dados; nenhum nome/consulta/paciente/lançamento da conta A aparece. |
| UI-SEC-02 | P0 | Conta autenticada | Remover token pela ferramenta de armazenamento do navegador e recarregar página privada. | Redireciona para login; nenhuma operação privada continua exibida como autenticada. |
| UI-ERR-01 | P1 | Backend acessível, depois indisponível em ambiente controlado | Abrir telas e executar uma leitura/escrita com API indisponível; restaurar API e repetir. | Erro é comunicado, formulário não indica sucesso falso e a interface recupera sem recarregar indefinidamente. |
| UI-ERR-02 | P1 | Fluxos de formulário | Enviar, aguardar spinner e clicar duas vezes rapidamente em salvar. | A interface evita duplicação de registros e indica claramente carregamento/resultado. |

## 5. Limitações e itens para triagem

Estes itens foram identificados no frontend e devem ser verificados/registrados durante a execução; não são pressupostos de aprovação:

- Login com Google está comentado na tela de login, portanto não há botão de login Google para validar por esse fluxo.
- O link “Esqueci a senha” não tem destino configurado aparente.
- A opção “Manter conectado” aparece no login, mas não há comportamento aparente associado a ela; comparar o comportamento da sessão com a opção marcada e desmarcada e registrar como lacuna se forem idênticos.
- Nas telas de pacientes e financeiro há controles “Baixar CSV” sem ação aparente na própria tela; confirmar manualmente se ocorre download.
- O ícone de cobrança em receita pendente executa apenas `console.log` no código atual; provavelmente não há ação funcional visível.
- O botão de anexo no cabeçalho de notas de sessão não apresenta handler aparente; a aba `Anexos` está vazia.
- As abas Instrumentos, Diário de Bordo, Documentos e Anexos mostram “Em breve” ou não têm implementação observável.
- O botão “Arquivar” no drawer do paciente não mostra ação ligada no código consultado.
- A página pública só leva paciente recorrente até confirmação; paciente novo é enviado ao Tally, então validar a criação depende do formulário externo/webhook configurado.
- A página `/pacientes/dates` depende de dados de navegação (state) para identificar o paciente; o acesso direto precisa ser exercitado.
- A confirmação pública do agendamento e validação de conflitos dependem do resultado do backend; registrar se a interface apresenta corretamente o erro de slot indisponível.

## 6. Critérios gerais de aprovação

- Nenhum campo inválido é silenciosamente aceito quando a interface apresenta regra de validação.
- Ação de sucesso produz feedback e atualiza os dados mostrados; recarga confirma persistência.
- Cancelar modal, confirmação ou edição não realiza a operação correspondente.
- Erros de rede/servidor não são apresentados como sucesso e não deixam controles permanentemente bloqueados.
- Datas, horários, valores em BRL, status e paciente associado correspondem aos dados inseridos.
- Dados de uma conta não aparecem para outra.
- Fluxos marcados como não implementados são anotados como lacuna, com evidência, em vez de serem contabilizados como aprovação.
