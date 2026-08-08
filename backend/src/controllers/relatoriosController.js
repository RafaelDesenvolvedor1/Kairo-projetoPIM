const { Op } = require('sequelize');

module.exports = (app) => {
  // Ajuste de chaves do Consign para carregar as models corretamente
  const Relatorios = app.models.relatorios || app.models.Relatorios;
  const Agendamentos = app.models.agendamentos || app.models.Agendamentos;
  const Anexos = app.models.anexos || app.models.Anexos;

  const relatoriosController = {
    /**
     * Busca a timeline completa do prontuário do paciente (Anotações, Laudos, Atestados)
     */
    async getProntuarioPaciente(req, res) {
      try {
        const id_usuario = req.user.id_usuario;
        const { id_paciente } = req.params;

        const prontuario = await Relatorios.findAll({
          where: { 
            id_paciente,
            id_usuario // Garante que o profissional só vê dados dos próprios pacientes
          },
          include: [
            {
              model: Agendamentos,
              as: 'agendamento',
              attributes: ['id_agendamento', 'data_hora_inicio', 'status'],
              required: false
            },
            {
              model: Anexos,
              as: 'anexos',
              attributes: ['id_anexo', 'nome_arquivo', 'caminho_arquivo', 'tipo_arquivo'],
              required: false
            }
          ],
          order: [['data_criacao', 'DESC']]
        });

        return res.json(prontuario);
      } catch (err) {
        console.error('Erro ao buscar prontuário:', err);
        return res.status(500).json({ msg: 'Internal server error', error: err.message });
      }
    },

    /**
     * Cria uma nova entrada no prontuário (sessão, laudo, atestado, etc.)
     */
    async create(req, res) {
      try {
        const id_usuario = req.user.id_usuario;
        const { id_paciente, id_agendamento, conteudo, tipo } = req.body;

        if (!conteudo) {
          return res.status(400).json({ msg: 'O conteúdo da anotação é obrigatório.' });
        }

        // Se um id_agendamento for enviado, valida se ele existe e pertence ao usuário
        if (id_agendamento) {
          const agendamento = await Agendamentos.findOne({
            where: { id_agendamento, id_usuario }
          });
          if (!agendamento) {
            return res.status(404).json({ msg: 'Agendamento não encontrado ou não pertence a este usuário.' });
          }
        }

        const novoRelatorio = await Relatorios.create({
          id_paciente,
          id_usuario,
          id_agendamento: id_agendamento || null,
          conteudo,
          tipo: tipo || 'sessao',
          data_criacao: new Date()
        });

        // Se for uma evolução de sessão vinculada a um agendamento, atualiza o status do agendamento para concluído
        if (id_agendamento) {
          await Agendamentos.update(
            { status: 'concluido' },
            { where: { id_agendamento } }
          );
        }

        return res.status(201).json(novoRelatorio);
      } catch (err) {
        console.error('Erro ao criar relatório:', err);
        return res.status(500).json({ msg: 'Internal server error', error: err.message });
      }
    },

    /**
     * Atualiza uma anotação existente
     */
    async update(req, res) {
      try {
        const id_usuario = req.user.id_usuario;
        const { id } = req.params;
        const { conteudo, tipo } = req.body;

        const relatorio = await Relatorios.findOne({
          where: { id_relatorio: id, id_usuario }
        });

        if (!relatorio) return res.sendStatus(404);

        if (conteudo) relatorio.conteudo = conteudo;
        if (tipo) relatorio.tipo = tipo;

        await relatorio.save();
        return res.json(relatorio);
      } catch (err) {
        console.error('Erro ao atualizar relatório:', err);
        return res.status(500).json({ msg: 'Internal server error', error: err.message });
      }
    },

    /**
     * Remove uma entrada do prontuário
     */
    async delete(req, res) {
      try {
        const id_usuario = req.user.id_usuario;
        const { id } = req.params;

        const relatorio = await Relatorios.findOne({
          where: { id_relatorio: id, id_usuario }
        });

        if (!relatorio) return res.sendStatus(404);

        // Remove os anexos vinculados fisicamente ou logicamente se houver lógica de upload
        if (Anexos) {
          await Anexos.destroy({ where: { id_relatorio: id } });
        }
        
        await relatorio.destroy();
        return res.sendStatus(204);
      } catch (err) {
        console.error('Erro ao deletar relatório:', err);
        return res.status(500).json({ msg: 'Internal server error', error: err.message });
      }
    }
  };

  return relatoriosController;
};