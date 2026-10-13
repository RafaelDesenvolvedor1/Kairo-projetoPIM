const { describe, it } = require('node:test');

describe('Rotas de horários', () => {
  it.todo('HOR-01: lista horários do usuário com associação e ordenação esperadas');
  it.todo('HOR-02: cria horário vinculado ao usuário e retorna associação do local');
  it.todo('HOR-03: consulta horário por ID sem expor registro de outro usuário');
  it.todo('HOR-04: atualiza horário sem aceitar id_usuario enviado no body');
  it.todo('HOR-05: exclui horário no escopo do usuário e trata registro ausente');
});