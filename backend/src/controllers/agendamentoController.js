module.exports = (app) => {
    const { Op } = require('sequelize');
    const Agendamentos = app.db.models.Agendamentos;
    const Pacientes = app.db.models.Pacientes;
    const googleCalendarService = require('../services/googleCalendarService')(app);

    return {
        create: async (req, res) => {
            try {
                const { id_paciente, data_hora_inicio, data_hora_fim, status = 'agendado', observacoes } = req.body;
                const id_usuario = req.user.id_usuario;

                // Validações básicas
                if (!id_paciente || !data_hora_inicio || !data_hora_fim) {
                    return res.status(400).json({ 
                        message: 'Campos obrigatórios faltando: id_paciente, data_hora_inicio, data_hora_fim' 
                    });
                }

                // Verificar se paciente pertence ao usuário
                const paciente = await Pacientes.findOne({
                    where: { id: id_paciente, id_usuario }
                });

                if (!paciente) {
                    return res.status(404).json({ message: 'Paciente não encontrado' });
                }

                // Verificar conflito de horário para o mesmo usuário
                const conflito = await Agendamentos.findOne({
                    where: {
                        id_usuario,
                        [Op.or]: [
                            {
                                data_hora_inicio: {
                                    [Op.between]: [data_hora_inicio, data_hora_fim]
                                }
                            },
                            {
                                data_hora_fim: {
                                    [Op.between]: [data_hora_inicio, data_hora_fim]
                                }
                            },
                            {
                                data_hora_inicio: { [Op.lte]: data_hora_inicio },
                                data_hora_fim: { [Op.gte]: data_hora_fim }
                            }
                        ]
                    }
                });

                if (conflito) {
                    return res.status(409).json({ message: 'Já existe um agendamento neste dia e horário' });
                }

                // Criar agendamento no banco
                const agendamento = await Agendamentos.create({
                    id_paciente,
                    id_usuario,
                    data_hora_inicio,
                    data_hora_fim,
                    status,
                    observacoes
                });

                // Tentar criar evento no Google Calendar se usuário estiver autenticado
                await googleCalendarService.createScheduleEvent(
                    id_usuario,
                    { data_hora_inicio, data_hora_fim, observacoes },
                    paciente.nomePaciente
                );

                return res.json({
                    message: 'Agendamento criado com sucesso',
                    agendamento
                });
            } catch (error) {
                console.error('Erro ao criar agendamento:', error);
                return res.status(500).json({ message: 'Erro ao criar agendamento', error: error.message });
            }
        },

        listAll: async (req, res) => {
            try {
                const id_usuario = req.user.id_usuario;

                const agendamentos = await Agendamentos.findAll({
                    where: { id_usuario },
                    include: [{ association: 'paciente', attributes: ['id', 'nomePaciente', 'email', 'telefone'] }],
                    order: [['data_hora_inicio', 'DESC']]
                });

                return res.json(agendamentos);
            } catch (error) {
                console.error('Erro ao listar agendamentos:', error);
                return res.status(500).json({ message: 'Erro ao listar agendamentos' });
            }
        },

        listByPaciente: async (req, res) => {
            try {
                const { id_paciente } = req.params;
                const id_usuario = req.user.id_usuario;

                const agendamentos = await Agendamentos.findAll({
                    where: { id_paciente, id_usuario },
                    order: [['data_hora_inicio', 'ASC']]
                });

                return res.json(agendamentos);
            } catch (error) {
                console.error('Erro ao listar agendamentos:', error);
                return res.status(500).json({ message: 'Erro ao listar agendamentos' });
            }
        },

        getById: async (req, res) => {
            try {
                const { id } = req.params;
                const id_usuario = req.user.id_usuario;

                const agendamento = await Agendamentos.findOne({
                    where: { id_agendamento: id, id_usuario },
                    include: [{ association: 'paciente' }]
                });

                if (!agendamento) {
                    return res.status(404).json({ message: 'Agendamento não encontrado' });
                }

                return res.json(agendamento);
            } catch (error) {
                console.error('Erro ao buscar agendamento:', error);
                return res.status(500).json({ message: 'Erro ao buscar agendamento' });
            }
        },

        update: async (req, res) => {
            try {
                const { id } = req.params;
                const { data_hora_inicio, data_hora_fim, status, observacoes } = req.body;
                const id_usuario = req.user.id_usuario;

                // Buscar agendamento
                const agendamento = await Agendamentos.findOne({
                    where: { id_agendamento: id, id_usuario }
                });

                if (!agendamento) {
                    return res.status(404).json({ message: 'Agendamento não encontrado' });
                }

                // Verificar conflito de horário para o mesmo usuário, ignorando o próprio registro
                if (data_hora_inicio && data_hora_fim) {
                    const conflito = await Agendamentos.findOne({
                        where: {
                            id_usuario,
                            id_agendamento: { [Op.ne]: id },
                            [Op.or]: [
                                {
                                    data_hora_inicio: {
                                        [Op.between]: [data_hora_inicio, data_hora_fim]
                                    }
                                },
                                {
                                    data_hora_fim: {
                                        [Op.between]: [data_hora_inicio, data_hora_fim]
                                    }
                                },
                                {
                                    data_hora_inicio: { [Op.lte]: data_hora_inicio },
                                    data_hora_fim: { [Op.gte]: data_hora_fim }
                                }
                            ]
                        }
                    });

                    if (conflito) {
                        return res.status(409).json({ message: 'Já existe um agendamento neste dia e horário' });
                    }
                }

                // Atualizar agendamento
                const updateData = {};
                if (data_hora_inicio) updateData.data_hora_inicio = data_hora_inicio;
                if (data_hora_fim) updateData.data_hora_fim = data_hora_fim;
                if (status) updateData.status = status;
                if (observacoes !== undefined) updateData.observacoes = observacoes;

                await agendamento.update(updateData);

                const updated = await Agendamentos.findOne({
                    where: { id_agendamento: id, id_usuario },
                    include: [{ association: 'paciente' }]
                });

                return res.json({
                    message: 'Agendamento atualizado com sucesso',
                    agendamento: updated
                });
            } catch (error) {
                console.error('Erro ao atualizar agendamento:', error);
                return res.status(500).json({ message: 'Erro ao atualizar agendamento', error: error.message });
            }
        },

        delete: async (req, res) => {
            try {
                const { id } = req.params;
                const id_usuario = req.user.id_usuario;

                const agendamento = await Agendamentos.findOne({
                    where: { id_agendamento: id, id_usuario }
                });

                if (!agendamento) {
                    return res.status(404).json({ message: 'Agendamento não encontrado' });
                }

                await agendamento.destroy();

                return res.json({ message: 'Agendamento deletado com sucesso' });
            } catch (error) {
                console.error('Erro ao deletar agendamento:', error);
                return res.status(500).json({ message: 'Erro ao deletar agendamento' });
            }
        }
    };
};
