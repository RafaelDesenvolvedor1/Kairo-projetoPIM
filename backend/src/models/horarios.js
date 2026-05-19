const { DataTypes } = require('sequelize');

module.exports = (app) => {
  const Horarios = app.db.define('Horarios', {
    id_horario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_local: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dia_semana: {
      type: DataTypes.ENUM('Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sabado', 'Domingo'),
      allowNull: false,
    },
    hora_inicio: {
      type: DataTypes.STRING(5),
      allowNull: false,
      validate: {
        matches: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      },
    },
    hora_fim: {
      type: DataTypes.STRING(5),
      allowNull: false,
      validate: {
        matches: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      },
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    tableName: 'Horarios',
    timestamps: false,
  });

  return Horarios;
};
