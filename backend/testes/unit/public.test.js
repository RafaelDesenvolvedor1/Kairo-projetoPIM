const { describe, it } = require('node:test');

describe('Rotas públicas', () => {
  it.todo('PUB-01: retorna perfil por slug com somente recursos ativos do profissional');
  it.todo('PUB-02: valida data obrigatória e slug de profissional existente');
  it.todo('PUB-03: retorna lista vazia quando não há expediente no dia solicitado');
  it.todo('PUB-04: gera slots de 60 minutos sem ultrapassar o fim do expediente');
  it.todo('PUB-05: remove horários ocupados e mantém horários com agendamento cancelado');
  it.todo('PUB-06: normaliza e-mail e verifica paciente existente ou inexistente');
  it.todo('PUB-07: rejeita agendamento público sem campos obrigatórios');
  it.todo('PUB-08: monta início e fim do agendamento público, inclusive perto da meia-noite');
  it.todo('PUB-09: regressão: valida propriedade do paciente e disponibilidade antes de criar');
});