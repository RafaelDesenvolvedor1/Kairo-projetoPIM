const { describe, it } = require('node:test');

describe('OAuth e integração com Google Calendar', () => {
  it.todo('GOOGLE-01: valida ID e existência do usuário antes do logout');
  it.todo('GOOGLE-02: limpa tokens Google e trata usuário inexistente ou sem vínculo');
  it.todo('GOOGLE-03: retorna somente os campos previstos de tokens Google');
  it.todo('GOOGLE-04: valida dados obrigatórios dos handlers de calendário');
  it.todo('GOOGLE-05: monta opções de listagem e total de eventos corretamente');
  it.todo('GOOGLE-06: encaminha dados para serviço de calendário e mapeia erros');
  it.todo('GOOGLE-07: trata usuário sem token nas operações do serviço Google');
  it.todo('GOOGLE-08: regressão de segurança: impede operações Google entre usuários');
  it.todo('GOOGLE-09: identifica registro duplicado dos caminhos OAuth nos módulos de rota');
});