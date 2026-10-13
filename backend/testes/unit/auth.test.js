const { describe, it } = require('node:test');

describe('Autenticação e OAuth', () => {
  it.todo('AUTH-01: rejeita login sem e-mail ou senha sem consultar o model');
  it.todo('AUTH-02: retorna resposta genérica para usuário inexistente ou senha incorreta');
  it.todo('AUTH-03: emite JWT com payload e expiração esperados para credencial válida');
  it.todo('AUTH-04: estratégia JWT rejeita payload sem usuário ou usuário inexistente');
  it.todo('AUTH-05: trata falha nos callbacks OAuth com status e corpo esperados');
  it.todo('AUTH-06: redireciona login Google com token e nome codificados');
  it.todo('AUTH-07: preserva o fluxo de vínculo Google identificado pelo state');
});