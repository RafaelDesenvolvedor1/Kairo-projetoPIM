module.exports = (app) => {
  const models = app.models || app.db?.models;
  if (!models) {
    throw new Error('Não foi possível encontrar os modelos em app.models ou app.db.models.');
  }

  const {
    users: Users,
    pacientes: Pacientes,
    agendamentos: Agendamentos,
    relatorios: Relatorios,
    anexos: Anexos,
    fichasClinicas: Fichas_Clinicas,
    financeiro: Financeiro,
    logsAcesso: Logs_Acesso,
    equipe: Equipe,
  } = models;

  if (Users) {
    if (Logs_Acesso) {
      Users.hasMany(Logs_Acesso, { foreignKey: 'id_usuario', as: 'logs' });
    }
    if (Financeiro) {
      Users.hasMany(Financeiro, { foreignKey: 'id_usuario', as: 'financeiro' });
    }
    if (Relatorios) {
      Users.hasMany(Relatorios, { foreignKey: 'id_usuario', as: 'relatorios' });
    }
    if (Fichas_Clinicas) {
      Users.hasMany(Fichas_Clinicas, { foreignKey: 'id_usuario', as: 'fichas_clinicas' });
    }
    if (Agendamentos) {
      Users.hasMany(Agendamentos, { foreignKey: 'id_usuario', as: 'agendamentos' });
    }
    if (Pacientes) {
      Users.hasMany(Pacientes, { foreignKey: 'id_usuario', as: 'pacientes' });
    }
    if (Equipe) {
      Users.hasOne(Equipe, { foreignKey: 'id_usuario', as: 'equipe_perfil' });
    }
  }

  if (Pacientes) {
    if (Users) {
      Pacientes.belongsTo(Users, { foreignKey: 'id_usuario', as: 'usuario' });
    }
    if (Agendamentos) {
      Pacientes.hasMany(Agendamentos, { foreignKey: 'id_paciente', as: 'agendamentos' });
    }
    if (Relatorios) {
      Pacientes.hasMany(Relatorios, { foreignKey: 'id_paciente', as: 'relatorios' });
    }
    if (Fichas_Clinicas) {
      Pacientes.hasMany(Fichas_Clinicas, { foreignKey: 'id_paciente', as: 'fichas_clinicas' });
    }
  }

  if (Agendamentos) {
    if (Pacientes) {
      Agendamentos.belongsTo(Pacientes, { foreignKey: 'id_paciente', as: 'paciente' });
    }
    if (Users) {
      Agendamentos.belongsTo(Users, { foreignKey: 'id_usuario', as: 'usuario' });
    }
    if (Relatorios) {
      Agendamentos.hasMany(Relatorios, { foreignKey: 'id_agendamento', as: 'relatorios' });
    }
  }

  if (Relatorios) {
    if (Pacientes) {
      Relatorios.belongsTo(Pacientes, { foreignKey: 'id_paciente', as: 'paciente' });
    }
    if (Users) {
      Relatorios.belongsTo(Users, { foreignKey: 'id_usuario', as: 'usuario' });
    }
    if (Agendamentos) {
      Relatorios.belongsTo(Agendamentos, { foreignKey: 'id_agendamento', as: 'agendamento' });
    }
    if (Anexos) {
      Relatorios.hasMany(Anexos, { foreignKey: 'id_relatorio', as: 'anexos' });
    }
  }

  if (Anexos) {
    if (Relatorios) {
      Anexos.belongsTo(Relatorios, { foreignKey: 'id_relatorio', as: 'relatorio' });
    }
    if (Fichas_Clinicas) {
      Anexos.belongsTo(Fichas_Clinicas, { foreignKey: 'id_ficha', as: 'ficha_clinica' });
    }
  }

  if (Fichas_Clinicas) {
    if (Pacientes) {
      Fichas_Clinicas.belongsTo(Pacientes, { foreignKey: 'id_paciente', as: 'paciente' });
    }
    if (Users) {
      Fichas_Clinicas.belongsTo(Users, { foreignKey: 'id_usuario', as: 'usuario' });
    }
    if (Anexos) {
      Fichas_Clinicas.hasMany(Anexos, { foreignKey: 'id_ficha', as: 'anexos' });
    }
  }

  if (Financeiro) {
    Financeiro.belongsTo(Users, { foreignKey: 'id_usuario', as: 'usuario' });
  }

  if (Logs_Acesso) {
    Logs_Acesso.belongsTo(Users, { foreignKey: 'id_usuario', as: 'usuario' });
  }

  if (Equipe) {
    Equipe.belongsTo(Users, { foreignKey: 'id_usuario', as: 'usuario' });
  }
};