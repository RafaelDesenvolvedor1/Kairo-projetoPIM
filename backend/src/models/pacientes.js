const { DataTypes } = require("sequelize");

module.exports = (app) => {
  const Pacientes = app.db.define(
    "Pacientes",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nomePaciente: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      telefone: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      // Novos campos cadastrais (Dados Pessoais)
      cpf: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      rg: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      dataNascimento: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      genero: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      profissao: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      estadoCivil: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      // Endereço
      cep: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      endereco: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      numero: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      complemento: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      bairro: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      cidade: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      estado: {
        type: DataTypes.STRING(2),
        allowNull: true,
      },
      // Contato de Emergência
      contatoEmergenciaNome: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      contatoEmergenciaTelefone: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      observacoes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "pacientes",
      timestamps: false,
    }
  );

  Pacientes.associate = (models) => {
    Pacientes.belongsTo(models.User, { foreignKey: 'id_usuario', as: 'usuario' });
    Pacientes.hasMany(models.Agendamentos, { foreignKey: 'id_paciente', as: 'agendamentos' });
    Pacientes.hasMany(models.Relatorios, { foreignKey: 'id_paciente', as: 'relatorios' });
    Pacientes.hasMany(models.Fichas_Clinicas, { foreignKey: 'id_paciente', as: 'fichas_clinicas' });
  };

  return Pacientes;
};