const { describe, it } = require('node:test');

describe('Validação e rotas de serviços', () => {
  it.todo('SERV-01: valida campos de criação e aplica defaults do schema');
  it.todo('SERV-02: valida atualização parcial sem alterar campos omitidos');
  it.todo('SERV-03: filtra serviços por usuário e pelo estado ativo');
  it.todo('SERV-04: cria serviço associado ao usuário autenticado');
  it.todo('SERV-05: impede consulta, atualização e remoção fora do escopo do usuário');
});