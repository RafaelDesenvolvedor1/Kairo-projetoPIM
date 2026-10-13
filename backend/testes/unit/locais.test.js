const { describe, it } = require('node:test');

describe('Validação e rotas de locais', () => {
  it.todo('LOCAL-01: valida endereço presencial, local de vídeo, CEP e campos obrigatórios');
  it.todo('LOCAL-02: cria endereço e local presencial na mesma transação');
  it.todo('LOCAL-03: cria local de vídeo sem criar endereço');
  it.todo('LOCAL-04: atualiza, cria ou remove endereço conforme mudança do local');
  it.todo('LOCAL-05: faz rollback ao falhar atualização e quando o local não existe');
  it.todo('LOCAL-06: exclui local e endereço na mesma transação e faz rollback em erro');
});