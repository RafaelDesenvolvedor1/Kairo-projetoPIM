const { describe, it } = require('node:test');

describe('Validação e rotas de pacientes', () => {
  it.todo('PAC-01: rejeita nome, e-mail, CPF, CEP e RG inválidos');
  it.todo('PAC-02: normaliza strings vazias e UF e aceita dados opcionais válidos');
  it.todo('PAC-03: aplica schema parcial em PUT/PATCH e schema completo na criação');
  it.todo('PAC-04: rejeita webhook Tally inválido ou sem identificador profissional');
  it.todo('PAC-05: mapeia campos Tally, opções e telefone e preenche endereço pelo CEP');
  it.todo('PAC-06: prossegue com cadastro quando a consulta externa de CEP falha');
  it.todo('PAC-07: limita CRUD de pacientes ao usuário autenticado');
  it.todo('PAC-08: valida busca parcial vazia e limita busca e contagem ao usuário');
});