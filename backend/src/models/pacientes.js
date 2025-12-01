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
    }
  );

  return Pacientes;
};
