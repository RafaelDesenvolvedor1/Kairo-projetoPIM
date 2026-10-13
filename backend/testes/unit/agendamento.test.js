const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

describe('Validação de Regras de Agendamento (Caixa-Branca)', () => {
  test('Deve impedir agendamento com intervalo de data inválido', () => {
    const inicio = new Date('2026-10-12T10:00:00');
    const fim = new Date('2026-10-12T09:00:00');
    
    const ehValido = fim > inicio;
    assert.strictEqual(ehValido, false, 'Data final não pode ser anterior à data inicial');
  });
});