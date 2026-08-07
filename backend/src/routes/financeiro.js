const { Op, fn, col } = require('sequelize');

module.exports = (app) => {
  // Ajuste de chaves do Consign baseado no nome dos arquivos da pasta models
  const Lancamento = app.models.financeiro || app.models.lancamento || app.models.Lancamento;
  const Parcelalancamento = app.models.parcelalancamento || app.models.Parcelalancamento;
  const Pacientes = app.models.pacientes || app.models.Pacientes || app.models.paciente;

  // Helper genérico para tratar erros e evitar o 412 genérico que quebra o front
  const handleError = (res, err) => {
    if (err && err.name === 'SequelizeValidationError') {
      const errors = err.errors ? err.errors.map(e => e.message) : [err.message];
      return res.status(400).json({ msg: 'Validation error', errors });
    }
    console.error(err);
    return res.status(500).json({ msg: 'Internal server error', error: err.message });
  };

  /**
   * GET /lancamentos/pacientes/lista - Lista pacientes do usuário para seleção no formulário
   */
  app
    .route('/lancamentos/pacientes/lista')
    .all(app.auth.authenticate())
    .get(async (req, res) => {
      try {
        const id_usuario = req.user.id_usuario;

        const pacientes = await Pacientes.findAll({
          where: { id_usuario },
          attributes: ['id', 'nomePaciente', 'email', 'telefone'],
          order: [['nomePaciente', 'ASC']],
        });

        return res.json(pacientes);
      } catch (err) {
        return handleError(res, err);
      }
    });

  /**
   * GET /lancamentos/faturamento - Retorna o faturamento do mês atual e do mês anterior
   */
  app
    .route('/lancamentos/faturamento')
    .all(app.auth.authenticate())
    .get(async (req, res) => {
      try {
        const id_usuario = req.user.id_usuario;
        const { mes } = req.query;

        let anoRef, mesRef;

        if (mes && /^\d{4}-\d{2}$/.test(mes)) {
          const parts = mes.split('-');
          anoRef = parseInt(parts[0], 10);
          mesRef = parseInt(parts[1], 10) - 1; // Mês em JavaScript é base 0 (0-11)
        } else {
          const hoje = new Date();
          anoRef = hoje.getFullYear();
          mesRef = hoje.getMonth();
        }

        // Mês Referência (Início e Fim)
        const dataInicioAtual = `${anoRef}-${String(mesRef + 1).padStart(2, '0')}-01`;
        const dataFimAtual = new Date(anoRef, mesRef + 1, 0).toISOString().split('T')[0];

        // Mês Anterior (Início e Fim)
        const dataAnteriorObj = new Date(anoRef, mesRef - 1, 1);
        const anoAnt = dataAnteriorObj.getFullYear();
        const mesAnt = dataAnteriorObj.getMonth();
        const dataInicioAnterior = `${anoAnt}-${String(mesAnt + 1).padStart(2, '0')}-01`;
        const dataFimAnterior = new Date(anoAnt, mesAnt + 1, 0).toISOString().split('T')[0];

        const safeSumReceitas = async (dataInicio, dataFim) => {
          try {
            if (!Lancamento) return 0;
            const value = await Lancamento.sum('valor', {
              where: {
                id_usuario,
                tipo: 'RECEITA',
                status: 'Pago',
                data_lancamento: {
                  [Op.between]: [dataInicio, dataFim],
                },
              },
            });
            if (value === null || value === undefined) return 0;
            const n = parseFloat(value);
            return Number.isNaN(n) ? 0 : n;
          } catch (e) {
            console.error('Erro ao somar faturamento:', e);
            return 0;
          }
        };

        const faturamentoAtual = await safeSumReceitas(dataInicioAtual, dataFimAtual);
        const faturamentoAnterior = await safeSumReceitas(dataInicioAnterior, dataFimAnterior);

        // Cálculo de variação percentual em relação ao mês anterior
        let comparativoPercentual = 0;
        if (faturamentoAnterior > 0) {
          comparativoPercentual = ((faturamentoAtual - faturamentoAnterior) / faturamentoAnterior) * 100;
        } else if (faturamentoAtual > 0) {
          comparativoPercentual = 100; // Crescimento de 100% se o mês anterior foi 0
        }

        return res.json({
          faturamentoAtual,
          faturamentoAnterior,
          comparativoPercentual: parseFloat(comparativoPercentual.toFixed(2)),
          periodoAtual: `${anoRef}-${String(mesRef + 1).padStart(2, '0')}`,
          periodoAnterior: `${anoAnt}-${String(mesAnt + 1).padStart(2, '0')}`,
        });

      } catch (err) {
        return handleError(res, err);
      }
    });

  /**
   * GET /lancamentos/grafico-historico - Retorna o histórico de receitas e despesas dos últimos 6 meses
   */
  app
    .route('/lancamentos/grafico-historico')
    .all(app.auth.authenticate())
    .get(async (req, res) => {
      try {
        const id_usuario = req.user.id_usuario;

        // 1. Calcula a data de início (6 meses atrás a partir do primeiro dia do mês)
        const hoje = new Date();
        const dataInicioObj = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1);
        const dataInicioStr = dataInicioObj.toISOString().split('T')[0];

        // 2. Busca todos os lançamentos pagos do período para o usuário
        const lancamentos = await Lancamento.findAll({
          where: {
            id_usuario,
            status: 'Pago',
            data_lancamento: {
              [Op.gte]: dataInicioStr
            }
          },
          attributes: ['tipo', 'valor', 'data_lancamento'],
          order: [['data_lancamento', 'ASC']]
        });

        // 3. Monta a estrutura base dos últimos 6 meses vazios
        const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const historicoMap = {};

        for (let i = 5; i >= 0; i--) {
          const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
          const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          historicoMap[chave] = {
            mesAno: chave,
            label: `${mesesNomes[d.getMonth()]}/${String(d.getFullYear()).slice(-2)}`,
            receitas: 0,
            despesas: 0
          };
        }

        // 4. Popula os dados agregados dos lançamentos
        lancamentos.forEach(l => {
          if (!l.data_lancamento) return;
          
          const chave = String(l.data_lancamento).substring(0, 7); 

          if (historicoMap[chave]) {
            const valor = parseFloat(l.valor) || 0;
            if (l.tipo === 'RECEITA') {
              historicoMap[chave].receitas += valor;
            } else if (l.tipo === 'DESPESA') {
              historicoMap[chave].despesas += valor;
            }
          }
        });

        const dadosGrafico = Object.values(historicoMap);

        return res.json(dadosGrafico);
      } catch (err) {
        return handleError(res, err);
      }
    });

  /**
   * GET /lancamentos/em-aberto - Retorna os lançamentos pendentes ordenados por data de vencimento
   */
  app
    .route('/lancamentos/em-aberto')
    .all(app.auth.authenticate())
    .get(async (req, res) => {
      try {
        const id_usuario = req.user.id_usuario;
        const limitParam = parseInt(req.query.limit, 10) || 5;

        if (!Lancamento) {
          return res.status(500).json({ msg: "Model de Lançamento não carregado." });
        }

        try {
          const pendentes = await Lancamento.findAll({
            where: {
              id_usuario,
              status: 'Pendente'
            },
            include: [
              {
                model: Pacientes,
                as: 'paciente',
                attributes: ['id', 'nomePaciente'],
                required: false
              }
            ],
            order: [['data_lancamento', 'ASC']],
            limit: limitParam
          });

          return res.json(pendentes);
        } catch (assocError) {
          console.warn("⚠️ Aviso: Fallback acionado na busca de lançamentos em aberto:", assocError.message);
          
          const fallbackPendentes = await Lancamento.findAll({
            where: {
              id_usuario,
              status: 'Pendente'
            },
            order: [['data_lancamento', 'ASC']],
            limit: limitParam
          });

          return res.json(fallbackPendentes);
        }

      } catch (err) {
        return handleError(res, err);
      }
    });

  /**
   * GET /lancamentos/consolidado/periodo - Consolidação de dados para cards
   */
  app
    .route('/lancamentos/consolidado/periodo')
    .all(app.auth.authenticate())
    .get(async (req, res) => {
      try {
        const id_usuario = req.user.id_usuario;
        const { mes } = req.query;

        let whereClause = { id_usuario };

        if (mes && /^\d{4}-\d{2}$/.test(mes)) {
          const [ano, mês] = mes.split('-');
          const dataInicio = `${ano}-${mês}-01`;
          const dataFim = new Date(ano, mês, 0).toISOString().split('T')[0];
          whereClause.data_lancamento = {
            [Op.between]: [dataInicio, dataFim],
          };
        }

        const safeSum = async (field, cond) => {
          try {
            if (!Lancamento) return 0;
            const value = await Lancamento.sum(field, { where: cond });
            if (value === null || value === undefined) return 0;
            const n = parseFloat(value);
            return Number.isNaN(n) ? 0 : n;
          } catch (e) {
            console.error('Erro ao somar', field, e);
            return 0;
          }
        };

        const despesasAPagar = await safeSum('valor', {
          ...whereClause,
          tipo: 'DESPESA',
          status: 'Pendente',
        });

        const receitasPrevistas = await safeSum('valor', {
          ...whereClause,
          tipo: 'RECEITA',
          status: 'Pendente',
        });

        const receitasRealizadas = await safeSum('valor', {
          ...whereClause,
          tipo: 'RECEITA',
          status: 'Pago',
        });

        const despesasRealizadas = await safeSum('valor', {
          ...whereClause,
          tipo: 'DESPESA',
          status: 'Pago',
        });

        return res.json({
          periodo: mes || 'todos',
          despesasAPagar,
          receitasPrevistas,
          receitasRealizadas,
          despesasRealizadas,
        });
      } catch (err) {
        console.error('Erro no consolidado/periodo:', err);
        return res.json({
          periodo: req.query.mes || 'todos',
          despesasAPagar: 0,
          receitasPrevistas: 0,
          receitasRealizadas: 0,
          despesasRealizadas: 0,
        });
      }
    });

  /**
   * GET /lancamentos - Lista lançamentos do usuário logado
   */
  app
    .route('/lancamentos')
    .all(app.auth.authenticate())
    .get(async (req, res) => {
      try {
        const id_usuario = req.user.id_usuario;
        const { mes } = req.query;

        const where = { id_usuario };

        if (mes && /^\d{4}-\d{2}$/.test(mes)) {
          const [ano, mês] = mes.split('-');
          const dataInicio = `${ano}-${mês}-01`;
          const dataFim = new Date(ano, mês, 0).toISOString().split('T')[0];
          where.data_lancamento = {
            [Op.between]: [dataInicio, dataFim],
          };
        }

        if (!Lancamento) {
          return res.status(500).json({ msg: "Model de Lançamento não carregado." });
        }

        try {
          const result = await Lancamento.findAll({
            where,
            include: [
              {
                model: Pacientes,
                as: 'paciente',
                attributes: ['id', 'nomePaciente'],
                required: false
              },
              {
                model: Parcelalancamento,
                as: 'parcelas',
                attributes: ['id_parcela', 'numero_parcela', 'data_vencimento', 'valor_parcela', 'status'],
                required: false
              },
            ],
            order: [['data_lancamento', 'DESC']],
          });
          
          return res.json(result || []);

        } catch (assocError) {
          console.warn("⚠️ Aviso: Falha nas associações do Sequelize. Buscando dados puros para manter a estabilidade:", assocError.message);
          
          const fallbackResult = await Lancamento.findAll({
            where,
            order: [['data_lancamento', 'DESC']],
          });
          
          return res.json(fallbackResult || []);
        }

      } catch (err) {
        console.error("Erro fatal ao buscar lançamentos:", err);
        return res.status(500).json({ msg: err.message, data: [] });
      }
    });

  /**
   * POST /lancamentos - Criar novo lançamento
   */
  app
    .route('/lancamentos')
    .all(app.auth.authenticate())
    .post(async (req, res) => {
      try {
        const id_usuario = req.user.id_usuario;
        const { tipo, categoria, valor, forma_pagamento, data_lancamento, id_paciente, quantidade_parcelas, descricao, prestacoes } = req.body;

        if (!Lancamento) {
          return res.status(500).json({ msg: "Model Lancamento indefinido no backend" });
        }

        const lancamento = await Lancamento.create({
          id_usuario,
          id_paciente: id_paciente || null,
          tipo,
          categoria,
          descricao: descricao || '',
          valor,
          forma_pagamento,
          data_lancamento: data_lancamento || (prestacoes && prestacoes[0]?.data_vencimento),
          status: 'Pendente',
          quantidade_parcelas: quantidade_parcelas || 1,
        });

        if (forma_pagamento === 'Parcelado' && prestacoes && prestacoes.length > 0) {
          const parcelasMapeadas = prestacoes.map((p) => ({
            id_lancamento: lancamento.id_lancamento,
            numero_parcela: p.numero_parcela,
            data_vencimento: p.data_vencimento,
            valor_parcela: p.valor_parcela,
            status: 'Pendente',
          }));
          await Parcelalancamento.bulkCreate(parcelasMapeadas);
        } else if (forma_pagamento === 'À vista') {
          await Parcelalancamento.create({
            id_lancamento: lancamento.id_lancamento,
            numero_parcela: 1,
            data_vencimento: data_lancamento,
            valor_parcela: valor,
            status: 'Pendente',
          });
        }

        try {
          const lancamentoComParcelas = await Lancamento.findByPk(lancamento.id_lancamento, {
            include: [{ model: Parcelalancamento, as: 'parcelas', required: false }],
          });

          return res.status(201).json(lancamentoComParcelas || lancamento);

        } catch (fetchError) {
          console.warn("⚠️ Aviso: Falha ao incluir parcelas no retorno do POST, enviando o objeto base salvo:", fetchError.message);
          return res.status(201).json(lancamento);
        }

      } catch (err) {
        return handleError(res, err);
      }
    });

  /**
   * GET /lancamentos/:id - Buscar lançamento específico por ID
   */
  app
    .route('/lancamentos/:id')
    .all(app.auth.authenticate())
    .get(async (req, res) => {
      try {
        const id_usuario = req.user.id_usuario;
        const { id } = req.params;

        if (!Lancamento) {
          return res.status(500).json({ msg: "Model de Lançamento não carregado." });
        }

        try {
          const result = await Lancamento.findOne({
            where: { 
              id_lancamento: id, 
              id_usuario 
            },
            include: [
              {
                model: Pacientes,
                as: 'paciente',
                attributes: ['id', 'nomePaciente', 'email', 'telefone'],
                required: false
              },
              {
                model: Parcelalancamento,
                as: 'parcelas',
                attributes: ['id_parcela', 'numero_parcela', 'data_vencimento', 'valor_parcela', 'status'],
                required: false
              },
            ]
          });
          
          if (result) {
            return res.json(result);
          } else {
            return res.sendStatus(404);
          }

        } catch (assocError) {
          console.warn("⚠️ Código de contingência ativado no GET por ID. Fallback por association:", assocError.message);
          
          const fallbackResult = await Lancamento.findOne({
            where: { 
              id_lancamento: id, 
              id_usuario 
            },
            include: [
              {
                association: 'paciente',
                attributes: ['id', 'nomePaciente'],
                required: false
              },
              {
                association: 'parcelas',
                required: false
              }
            ]
          });
          
          if (fallbackResult) {
            return res.json(fallbackResult);
          } else {
            return res.sendStatus(404);
          }
        }

      } catch (err) {
        console.error("Erro fatal ao buscar lançamento por ID:", err);
        return res.status(500).json({ msg: err.message });
      }
    });

  /**
   * PUT /lancamentos/:id - Atualizar lançamento
   */
  app
    .route('/lancamentos/:id')
    .all(app.auth.authenticate())
    .put(async (req, res) => {
      try {
        const id_usuario = req.user.id_usuario;
        const { id } = req.params;
        const { status, data_pagamento, categoria, tipo, valor, descricao, data_lancamento } = req.body;

        const lancamento = await Lancamento.findOne({
          where: { id_lancamento: id, id_usuario },
        });

        if (!lancamento) return res.sendStatus(404);

        if (status) lancamento.status = status;
        if (categoria) lancamento.categoria = categoria;
        if (tipo) lancamento.tipo = tipo;
        if (valor) lancamento.valor = valor;
        if (descricao !== undefined) lancamento.descricao = descricao;
        if (data_lancamento) lancamento.data_lancamento = data_lancamento;

        await lancamento.save();

        if (data_pagamento && lancamento.forma_pagamento === 'Parcelado') {
          const parcelas = await Parcelalancamento.findAll({
            where: { id_lancamento: id },
          });

          for (let parcela of parcelas) {
            if (parcela.data_vencimento <= data_pagamento) {
              parcela.status = 'Pago';
              parcela.data_pagamento = data_pagamento;
              await parcela.save();
            }
          }
        }

        return res.json(lancamento);
      } catch (err) {
        return handleError(res, err);
      }
    });

  /**
   * DELETE /lancamentos/:id - Deletar lançamento e suas dependências
   */
  app
    .route('/lancamentos/:id')
    .all(app.auth.authenticate())
    .delete(async (req, res) => {
      try {
        const id_usuario = req.user.id_usuario;
        const { id } = req.params;

        const lancamento = await Lancamento.findOne({
          where: { id_lancamento: id, id_usuario },
        });

        if (!lancamento) return res.sendStatus(404);

        await Parcelalancamento.destroy({ where: { id_lancamento: id } });
        await lancamento.destroy();

        return res.sendStatus(204);
      } catch (err) {
        return handleError(res, err);
      }
    });
};