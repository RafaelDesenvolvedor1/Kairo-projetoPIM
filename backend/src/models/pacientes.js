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
        type: DataTypes.STRING(50),
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
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },
    {
      tableName: "pacientes",
      timestamps: false, // Mantendo o padrão das outras sem timestamps automáticos do Sequelize
    }
  );

  Pacientes.associate = (models) => {
    // Chave estrangeira nas tabelas filhas aponta para o seu 'id' atual
    Pacientes.hasMany(models.Agendamentos, { foreignKey: 'id_paciente', as: 'agendamentos' });
    Pacientes.hasMany(models.Relatorios, { foreignKey: 'id_paciente', as: 'relatorios' });
    Pacientes.hasMany(models.Fichas_Clinicas, { foreignKey: 'id_paciente', as: 'fichas_clinicas' });
  };

  return Pacientes;
};