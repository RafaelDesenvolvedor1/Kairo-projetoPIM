const { Op } = require('sequelize');

module.exports = (app) => {
  // Models mapeados pelo Consign / Sequelize
  const Users =
    app.models?.Users ||
    app.models?.users ||
    app.models?.Usuarios ||
    app.models?.usuarios;

  const Servicos =
    app.models?.Servicos ||
    app.models?.servicos;

  const Locais =
    app.models?.Locais ||
    app.models?.locais;

  const Horarios =
    app.models?.Horarios ||
    app.models?.horarios;

  const Agendamentos =
    app.models?.Agendamentos ||
    app.models?.agendamentos;

  const Pacientes =
    app.models?.Pacientes ||
    app.models?.pacientes;

  // ==========================================
  // 1. Perfil Público do Profissional
  // ==========================================
  app.get('/public/perfil/:slug', async (req, res) => {
    try {
      const { slug } = req.params;

      if (!Users) {
        return res.status(500).json({
          mensagem: 'Model de Usuários não foi carregado corretamente.',
        });
      }

      const usuario = await Users.findOne({
        where: { slug },
        attributes: ['id_usuario', 'nome', 'email', 'slug'],
      });

      if (!usuario) {
        return res.status(404).json({ mensagem: 'Profissional não encontrado.' });
      }

      const id_usuario = usuario.id_usuario;

      const [servicos, locais, horarios] = await Promise.all([
        Servicos
          ? Servicos.findAll({
              where: { id_usuario, ativo: true },
              order: [['nome', 'ASC']],
            })
          : [],
        Locais
          ? Locais.findAll({
              where: { id_usuario, ativo: true },
              order: [['nome', 'ASC']],
            })
          : [],
        Horarios
          ? Horarios.findAll({
              where: { id_usuario, ativo: true },
              order: [
                ['dia_semana', 'ASC'],
                ['hora_inicio', 'ASC']],
            })
          : [],
      ]);

      return res.json({
        sucesso: true,
        profissional: usuario,
        servicos,
        locais,
        horarios,
      });
    } catch (error) {
      console.error('ERRO DETALHADO /public/perfil/:slug:', error);
      return res.status(500).json({
        mensagem: 'Erro interno ao carregar perfil público.',
        detalhe: error.message,
      });
    }
  });

  // Função auxiliar para fatiar um intervalo em slots de 60 minutos (ou duração customizada)
  const gerarSlots = (horaInicio, horaFim, intervaloMinutos = 60) => {
    const slots = [];
    const [hIni, mIni] = horaInicio.split(':').map(Number);
    const [hFim, mFim] = horaFim.split(':').map(Number);

    let minutosAtuais = hIni * 60 + mIni;
    const minutosLimite = hFim * 60 + mFim;

    while (minutosAtuais + intervaloMinutos <= minutosLimite) {
      const hSlotIni = Math.floor(minutosAtuais / 60);
      const mSlotIni = minutosAtuais % 60;

      const minutosFimSlot = minutosAtuais + intervaloMinutos;
      const hSlotFim = Math.floor(minutosFimSlot / 60);
      const mSlotFim = minutosFimSlot % 60;

      slots.push({
        hora_inicio: `${String(hSlotIni).padStart(2, '0')}:${String(mSlotIni).padStart(2, '0')}`,
        hora_fim: `${String(hSlotFim).padStart(2, '0')}:${String(mSlotFim).padStart(2, '0')}`,
      });

      minutosAtuais += intervaloMinutos;
    }

    return slots;
  };

  // ==========================================
  // 2. Horários Livres (Slots Fatiados) por Data
  // ==========================================
  app.get('/public/horarios-disponiveis/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const { data } = req.query; // Formato YYYY-MM-DD

      if (!data) {
        return res.status(400).json({ mensagem: 'O parâmetro data é obrigatório (YYYY-MM-DD).' });
      }

      const usuario = await Users.findOne({
        where: { slug },
        attributes: ['id_usuario'],
      });

      if (!usuario) {
        return res.status(404).json({ mensagem: 'Profissional não encontrado.' });
      }

      const id_usuario = usuario.id_usuario;

      // 1. Identificar o dia da semana
      const diasSemanaMap = [
        'Domingo',
        'Segunda',
        'Terça',
        'Quarta',
        'Quinta',
        'Sexta',
        'Sabado',
      ];
      const [ano, mes, dia] = data.split('-').map(Number);
      const dataObj = new Date(ano, mes - 1, dia);
      const diaSemanaTexto = diasSemanaMap[dataObj.getDay()];

      // 2. Buscar expedientes/turnos cadastrados para esse dia
      const expedientesConfigurados = await Horarios.findAll({
        where: {
          id_usuario,
          dia_semana: diaSemanaTexto,
          ativo: true,
        },
        order: [['hora_inicio', 'ASC']],
      });

      if (!expedientesConfigurados || expedientesConfigurados.length === 0) {
        return res.json({
          sucesso: true,
          dia_semana: diaSemanaTexto,
          horarios: [],
        });
      }

      // 3. Fatiar os expedientes em slots de 60 minutos (ex: 07:00-13:00 vira 07:00, 08:00, 09:00...)
      const todosSlots = [];
      expedientesConfigurados.forEach((exp) => {
        const slotsDoTurno = gerarSlots(
          exp.hora_inicio.substring(0, 5),
          exp.hora_fim.substring(0, 5),
          60 // intervalo de 1 hora
        );
        slotsDoTurno.forEach((slot) => {
          todosSlots.push({
            ...slot,
            id_local: exp.id_local,
          });
        });
      });

      // 4. Buscar agendamentos já marcados para o dia (não cancelados)
      let agendamentosExistentes = [];
      if (Agendamentos) {
        agendamentosExistentes = await Agendamentos.findAll({
          where: {
            id_usuario,
            data_hora_inicio: {
              [Op.between]: [`${data} 00:00:00`, `${data} 23:59:59`],
            },
            status: {
              [Op.ne]: 'cancelado',
            },
          },
          attributes: ['data_hora_inicio'],
        });
      }

      // 5. Horas ocupadas (HH:mm)
      const horasOcupadas = agendamentosExistentes.map((ag) => {
        const val = ag.data_hora_inicio;
        if (typeof val === 'string') {
          return val.includes(' ') ? val.split(' ')[1].substring(0, 5) : val.substring(11, 16);
        }
        const d = new Date(val);
        const horas = String(d.getHours()).padStart(2, '0');
        const minutos = String(d.getMinutes()).padStart(2, '0');
        return `${horas}:${minutos}`;
      });

      // 6. Filtrar apenas os slots livres
      const slotsLivres = todosSlots.filter((slot) => !horasOcupadas.includes(slot.hora_inicio));

      return res.json({
        sucesso: true,
        dia_semana: diaSemanaTexto,
        horarios: slotsLivres,
      });
    } catch (error) {
      console.error('ERRO /public/horarios-disponiveis:', error);
      return res.status(500).json({
        mensagem: 'Erro interno ao consultar horários disponíveis.',
        detalhe: error.message,
      });
    }
  });

  // ==========================================
  // 3. Verificar se o Paciente já tem Cadastro
  // ==========================================
  app.post('/public/verificar-paciente', async (req, res) => {
    try {
      const { email, id_usuario } = req.body;

      if (!email || !id_usuario) {
        return res.status(400).json({
          mensagem: 'Campos email e id_usuario são obrigatórios.',
        });
      }

      if (!Pacientes) {
        return res.status(500).json({
          mensagem: 'Model de Pacientes não encontrado.',
        });
      }

      const paciente = await Pacientes.findOne({
        where: {
          email: email.trim().toLowerCase(),
          id_usuario,
        },
        // Usando as colunas reais da tabela: id e nome_paciente
        attributes: ['id', 'nome_paciente', 'email', 'telefone'],
      });

      if (paciente) {
        return res.json({
          existe: true,
          paciente: {
            id_paciente: paciente.id,
            nome: paciente.nome_paciente, // mapeado para 'nome' para o frontend consumir normalmente
            email: paciente.email,
            telefone: paciente.telefone,
          },
        });
      }

      return res.json({
        existe: false,
      });
    } catch (error) {
      console.error('ERRO /public/verificar-paciente:', error);
      return res.status(500).json({
        mensagem: 'Erro ao verificar cadastro do paciente.',
        detalhe: error.message,
      });
    }
  });

  // ==========================================
  // 4. Confirmar Agendamento (Paciente Recorrente)
  // ==========================================
  app.post('/public/agendamento', async (req, res) => {
    try {
      const {
        id_usuario,
        id_paciente,
        id_servico,
        id_local,
        data,        // formato 'YYYY-MM-DD'
        hora_inicio, // formato 'HH:mm'
      } = req.body;

      if (!id_usuario || !id_paciente || !data || !hora_inicio) {
        return res.status(400).json({
          mensagem: 'Dados incompletos para efetuar o agendamento.',
        });
      }

      // Calcula data e hora de término somando 1 hora (ou duração padrão)
      const dataHoraInicioStr = `${data} ${hora_inicio}:00`;
      const [hora, minuto] = hora_inicio.split(':').map(Number);
      const horaFimStr = `${String((hora + 1) % 24).padStart(2, '0')}:${String(minuto).padStart(2, '0')}:00`;
      const dataHoraFimStr = `${data} ${horaFimStr}`;

      const novoAgendamento = await Agendamentos.create({
        id_usuario,
        id_paciente,
        id_servico: id_servico || null,
        id_local: id_local || null,
        data_hora_inicio: dataHoraInicioStr,
        data_hora_fim: dataHoraFimStr,
        status: 'agendado',
        observacoes: 'Agendamento realizado via Landing Page pública',
      });

      return res.status(201).json({
        sucesso: true,
        mensagem: 'Agendamento confirmado com sucesso!',
        agendamento: novoAgendamento,
      });
    } catch (error) {
      console.error('ERRO /public/agendamento:', error);
      return res.status(500).json({
        mensagem: 'Erro ao registar o agendamento.',
        detalhe: error.message,
      });
    }
  });
};