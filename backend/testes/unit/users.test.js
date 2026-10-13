const { describe, it } = require('node:test');

describe('Rotas de usuários', () => {
  it.todo('USER-01: rejeita cadastro sem nome, e-mail ou senha');
  it.todo('USER-02: aplica defaults no cadastro e recarrega o usuário antes da resposta');
  it.todo('USER-03: consulta somente o usuário autenticado e trata usuário ausente');
  it.todo('USER-04: exclui somente o usuário autenticado e trata erro do model');
});