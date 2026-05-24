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

                if (!id_paciente || !data_hora_inicio || !data_hora_fim) {
                    return res.status(400).json({ 
                        message: 'Campos obrigatórios faltando: id_paciente, data_hora_inicio, data_hora_fim' 
                    });
                }

                const paciente = await Pacientes.findOne({
                    where: { id: id_paciente, id_usuario }
                });

                if (!paciente) {
                    return res.status(404).json({ message: 'Paciente não encontrado' });
                }

                const conflito = await Agendamentos.findOne({
                    where: {
                        id_usuario,
                        [Op.or]: [
                            { data_hora_inicio: { [Op.between]: [data_hora_inicio, data_hora_fim] } },
                            { data_hora_fim: { [Op.between]: [data_hora_inicio, data_hora_fim] } },
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

                const agendamento = await Agendamentos.create({
                    id_paciente,
                    id_usuario,
                    data_hora_inicio,
                    data_hora_fim,
                    status,
                    observacoes
                });

                const nomeDoPaciente = paciente.nomePaciente || paciente.nome || 'Paciente';
                const googleEvent = await googleCalendarService.createScheduleEvent(
                    id_usuario,
                    { data_hora_inicio, data_hora_fim, observacoes },
                    nomeDoPaciente
                );

                if (googleEvent && googleEvent.id) {
                    await agendamento.update({ google_event_id: googleEvent.id });
                }

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

        // NOVO MÉTODO: Listar agendamentos apenas do dia atual
      listToday: async (req, res) => {
            try {
                const id_usuario = req.user.id_usuario;

                // 1. Pega a data atual no fuso de Brasília (Ex: "2026-05-24")
                const dataLocal = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });

                // 2. Define o limite inicial: meia-noite do dia atual local
                const startOfDay = `${dataLocal} 00:00:00`;

                // 3. Define o limite final: avança para o dia seguinte e joga o limite até as 03:00 AM
                // Isso compensa o fuso de -3h de Brasília e captura agendamentos do final da noite
                const amanha = new Date();
                amanha.setDate(amanha.getDate() + 1);
                const dataAmanhaLocal = amanha.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
                
                const endOfDay = `${dataAmanhaLocal} 03:00:00`;

                const agendamentos = await Agendamentos.findAll({
                    where: { 
                        id_usuario,
                        data_hora_inicio: {
                            [Op.between]: [startOfDay, endOfDay]
                        }
                    },
                    include: [{ association: 'paciente', attributes: ['id', 'nomePaciente', 'email', 'telefone'] }],
                    order: [['data_hora_inicio', 'ASC']] 
                });

                return res.json(agendamentos);
            } catch (error) {
                console.error('Erro ao listar agendamentos de hoje:', error);
                return res.status(500).json({ message: 'Erro ao listar agendamentos de hoje' });
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

                const agendamento = await Agendamentos.findOne({
                    where: { id_agendamento: id, id_usuario },
                    include: [{ association: 'paciente' }]
                });

                if (!agendamento) {
                    return res.status(404).json({ message: 'Agendamento não encontrado' });
                }

                if (data_hora_inicio && data_hora_fim) {
                    const conflito = await Agendamentos.findOne({
                        where: {
                            id_usuario,
                            id_agendamento: { [Op.ne]: id },
                            [Op.or]: [
                                { data_hora_inicio: { [Op.between]: [data_hora_inicio, data_hora_fim] } },
                                { data_hora_fim: { [Op.between]: [data_hora_inicio, data_hora_fim] } },
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

                const updateData = {};
                if (data_hora_inicio) updateData.data_hora_inicio = data_hora_inicio;
                if (data_hora_fim) updateData.data_hora_fim = data_hora_fim;
                if (status) updateData.status = status;
                if (observacoes !== undefined) updateData.observacoes = observacoes;

                await agendamento.update(updateData);

                if (agendamento.google_event_id) {
                    const nomeDoPaciente = agendamento.paciente ? (agendamento.paciente.nomePaciente || agendamento.paciente.nome) : 'Paciente';
                    const eventData = {
                        summary: `Agendamento - ${nomeDoPaciente}`,
                        description: updateData.observacoes || agendamento.observacoes || 'Sem observações',
                        start: {
                            dateTime: new Date(updateData.data_hora_inicio || agendamento.data_hora_inicio).toISOString(),
                            timeZone: 'America/Sao_Paulo'
                        },
                        end: {
                            dateTime: new Date(updateData.data_hora_fim || agendamento.data_hora_fim).toISOString(),
                            timeZone: 'America/Sao_Paulo'
                        }
                    };

                    await googleCalendarService.updateCalendarEvent(id_usuario, agendamento.google_event_id, eventData);
                }

                const updated = await Agendamentos.findOne({
                    where: { id_agendamento: id, id_usuario },
                    include: [{ association: 'paciente' }]
                });

                return res.json({
                    message: 'Agendamento updated com sucesso',
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

                if (agendamento.google_event_id) {
                    await googleCalendarService.deleteCalendarEvent(id_usuario, agendamento.google_event_id);
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