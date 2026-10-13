const { describe, it } = require('node:test');

describe('Controller de agendamentos', () => {
  it.todo('AG-01: rejeita criação sem campos obrigatórios antes de acessar dependências');
  it.todo('AG-02: não cria agendamento quando paciente não pertence ao usuário');
  it.todo('AG-03: cria agendamento sem conflito e funciona sem sincronização Google');
  it.todo('AG-04: rejeita sobreposição parcial ou total com HTTP 409');
  it.todo('AG-05: salva ID do evento Google e trata sincronização opcional');
  it.todo('AG-06: aplica filtros, ordenações e limites dos indicadores por usuário');
  it.todo('AG-07: trata consulta e atualização de registro ausente ou alheio');
  it.todo('AG-08: atualiza somente campos enviados e sincroniza evento existente');
  it.todo('AG-09: exclui agendamento e evento Google na ordem definida');
  it.todo('AG-10: regressão: rejeita data final menor ou igual à inicial no fluxo real');
});