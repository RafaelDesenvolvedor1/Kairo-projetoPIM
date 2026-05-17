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
          // Tenta buscar trazendo as tabelas relacionadas grudadas
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
          
          // Busca de contingência (sem relacionamentos complexos que possam quebrar no Sequelize)
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

        // Criar lançamento pai
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

        // Gravação das parcelas baseado no payload do Front-end
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
          // Tenta responder com a estrutura completa e suas parcelas
          const lancamentoComParcelas = await Lancamento.findByPk(lancamento.id_lancamento, {
            include: [{ model: Parcelalancamento, as: 'parcelas', required: false }],
          });

          return res.status(201).json(lancamentoComParcelas || lancamento);

        } catch (fetchError) {
          console.warn("⚠️ Aviso: Falha ao incluir parcelas no retorno do POST, enviando o objeto base salvo:", fetchError.message);
          
          // Se a associação falhar, enviamos o objeto base recém-criado com status 201 (Created)
          // Isso impede que o Front-end receba status 500 e exiba o toast de erro!
          return res.status(201).json(lancamento);
        }

      } catch (err) {
        return handleError(res, err);
      }
    });

  /**
   * GET /lancamentos/:id - Buscar lançamento específico
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

        // Tenta buscar trazendo as tabelas relacionadas com os codinomes exatos do Sequelize
        try {
          const result = await Lancamento.findAll({
            where,
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
            ],
            order: [['data_lancamento', 'DESC']],
          });
          
          return res.json(result || []);

        } catch (assocError) {
          console.warn("⚠️ Código de contingência ativado. Tentando variação de codinome de associação para o model Pacientes:", assocError.message);
          
          // Fallback inteligente caso o Sequelize prefira a busca direta baseada em Strings ou chaves implícitas
          const fallbackResult = await Lancamento.findAll({
            where,
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
            ],
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
   * PUT /lancamentos/:id - Atualizar lançamento (Dar Baixa / Alterar Status)
   */
  app
    .route('/lancamentos/:id')
    .all(app.auth.authenticate())
    .put(async (req, res) => {
      try {
        const id_usuario = req.user.id_usuario;
        const { id } = req.params;
        const { status, data_pagamento } = req.body;

        const lancamento = await Lancamento.findOne({
          where: { id_lancamento: id, id_usuario },
        });

        if (!lancamento) return res.sendStatus(404);

        if (status) lancamento.status = status;
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