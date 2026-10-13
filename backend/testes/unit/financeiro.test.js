const { describe, it } = require('node:test');

describe('Rotas financeiras', () => {
  it.todo('FIN-01: calcula limites do mês atual e anterior para faturamento');
  it.todo('FIN-02: usa mês corrente quando o parâmetro de mês é omitido ou inválido');
  it.todo('FIN-03: converte soma nula, inválida ou com erro em zero');
  it.todo('FIN-04: calcula variação percentual incluindo divisor zero e arredondamento');
  it.todo('FIN-05: agrega receitas e despesas nos seis meses do gráfico histórico');
  it.todo('FIN-06: usa limite padrão e fallback de associação em lançamentos em aberto');
  it.todo('FIN-07: consolida receitas e despesas por status e período');
  it.todo('FIN-08: filtra listagem por usuário/mês e usa fallback sem associações');
  it.todo('FIN-09: cria lançamento à vista ou parcelado e monta parcelas corretamente');
  it.todo('FIN-10: isola consulta, atualização e exclusão e atualiza parcelas vencidas');
});