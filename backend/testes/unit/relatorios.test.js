const { describe, it } = require('node:test');

describe('Controller de relatórios e prontuário', () => {
  it.todo('REL-01: consulta prontuário por paciente isolando dados pelo usuário');
  it.todo('REL-02: rejeita relatório sem conteúdo e não atualiza agendamento');
  it.todo('REL-03: valida propriedade do agendamento e conclui sessão associada');
  it.todo('REL-04: atualiza relatório próprio e rejeita relatório ausente ou alheio');
  it.todo('REL-05: exclui anexos e relatório próprio, incluindo ausência do model de anexos');
});